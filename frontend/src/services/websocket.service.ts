import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';
import { ref, computed } from 'vue';

export interface WebSocketEvent {
    type: string;
    familyId?: string;
    userId?: string;
    childId?: string;
    trackableId?: string;
    [key: string]: any;
}

class WebSocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 5000; // 5 seconds
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    public isConnected = ref(false);
    public isReconnecting = ref(false);
    public lastError = ref<string | null>(null);

    private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();

    constructor() {
        // Auto-connect when auth store has token - but delay to ensure store is initialized
        setTimeout(() => {
            const authStore = useAuthStore();
            if (authStore.isAuthenticated && authStore.token) {
                this.connect();
            } else {
                console.warn('Auth token not available yet, skipping automatic WebSocket connection');
            }
        }, 1000); // Increased to 1 second
    }

    connect(token?: string): void {
        const authStore = useAuthStore();
        const authToken = token || authStore.token;

        if (!authToken) {
            console.warn('No auth token available for WebSocket connection');
            return;
        }

        if (this.socket?.connected) {
            return;
        }

        // Disconnect any existing socket before creating a new one
        this.disconnect();

        this.lastError.value = null;


        // Fix: Remove /api/v1 from WebSocket URL - WebSocket server runs on base URL
        let serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Remove /api/v1 suffix if present - WebSocket doesn't use API versioning
        if (serverUrl.endsWith('/api/v1')) {
            serverUrl = serverUrl.replace('/api/v1', '');
        }

        const namespace = '/events';

        // Updated connection configuration
        this.socket = io(`${serverUrl}${namespace}`, {
            auth: {
                token: authToken
            },
            path: '/socket.io',
            // Fixed transport configuration - start with polling first
            transports: ['polling', 'websocket'],
            upgrade: true,
            // Connection timeout and retry settings
            timeout: 10000,
            reconnection: false, // Handle reconnection manually
            forceNew: true,
            // Add these for better stability
            autoConnect: true,
            // CORS and connection settings
            withCredentials: true,
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {

            this.isConnected.value = true;
            this.isReconnecting.value = false;
            this.reconnectAttempts = 0;
            this.lastError.value = null;

            // Clear reconnect timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        });

        // Listen for primary family assignment
        this.socket.on('primary-family', (data) => {
            if (data && data.familyId) {
                // Automatically join the primary family room
                this.joinFamily(data.familyId);
            }
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected.value = false;

            // Different handling based on disconnect reason
            if (reason === 'io client disconnect') {
                return;
            }

            if (reason === 'io server disconnect') {
                this.handleAuthError();
                return;
            }

            // For other reasons (transport errors, ping timeout, etc.), attempt reconnection
            this.attemptReconnect();
        });

        this.socket.on('connect_error', (error) => {

            this.isConnected.value = false;
            this.lastError.value = error.message;

            // Enhanced error handling
            if (error.message.includes('xhr poll error') || error.message.includes('websocket error')) {
                this.lastError.value = 'Server connection failed - please check if the server is running';
            }

            if (error.message.includes('CORS')) {
                this.lastError.value = 'CORS error - server configuration issue';
            }

            // Check if this is an auth error
            if (error.message.includes('auth') || error.message.includes('token')) {
                this.handleAuthError();
                return;
            }

            this.attemptReconnect();
        });

        // Authentication events
        this.socket.on('error', (error) => {
            this.lastError.value = error.message || 'Server error';

            if (error.type === 'AUTH_INVALID' || error.type === 'AUTH_REQUIRED') {
                this.handleAuthError();
            }
        });

        this.socket.on('authentication_failed', (_data) => {
            this.handleAuthError();
        });

        // Family and data events
        this.setupDataEventListeners();
    }

    private setupDataEventListeners(): void {
        if (!this.socket) return;

        const events = [
            'family.updated',
            'family.member.joined',
            'family.member.left',
            'family.member.updated',
            'family.member.removed',
            'child.created',
            'child.updated',
            'trackable.created',
            'trackable.updated',
            'trackable.deleted',
            'event.created',
            'event.updated',
            'event.deleted',
            'event.milestone.created',
            'event.milestone.deleted'
        ];

        events.forEach(event => {
            this.socket?.on(event, (data: WebSocketEvent) => {
                this.handleEvent(event, data);
            });
        });
    }

    private handleEvent(event: string, data: WebSocketEvent): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) { }
            });
        }
    }

    private handleAuthError(): void {
        const authStore = useAuthStore();

        console.error('WebSocket authentication error details:', {
            connected: this.isConnected.value,
            reconnecting: this.isReconnecting.value,
            reconnectAttempts: this.reconnectAttempts,
            lastError: this.lastError.value
        });

        // Disconnect and logout
        this.disconnect();
        authStore.logout();
    }

    refreshConnection(): void {
        this.disconnect();

        setTimeout(() => {
            const authStore = useAuthStore();
            if (authStore.isAuthenticated && authStore.token) {
                this.connect();
            }
        }, 1000); // Increased delay
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.isReconnecting.value = false;
            this.lastError.value = 'Connection lost - maximum retry attempts exceeded';
            return;
        }

        if (this.reconnectTimer) {
            return; // Already attempting reconnection
        }

        this.isReconnecting.value = true;
        this.reconnectAttempts++;

        const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            const authStore = useAuthStore();
            if (authStore.token) {
                this.connect();
            } else {
                this.isReconnecting.value = false;
            }
        }, delay);
    }

    disconnect(): void {

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.socket) {
            // Remove all event listeners to prevent memory leaks
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }

        this.isConnected.value = false;
        this.isReconnecting.value = false;
        this.reconnectAttempts = 0;
    }

    // Event subscription methods
    on(event: string, handler: (data: any) => void): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
    }

    off(event: string, handler?: (data: any) => void): void {
        if (!this.eventHandlers.has(event)) return;

        if (handler) {
            const handlers = this.eventHandlers.get(event)!;
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        } else {
            this.eventHandlers.delete(event);
        }
    }

    // Utility methods
    joinFamily(familyId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('join-family', { familyId });
        }
    }

    // Request initial connected caregivers status
    requestConnectedCaregivers(familyId?: string): void {
        if (this.socket?.connected) {
            this.socket.emit('request-connected-caregivers', { familyId });
        }
    }

    // Computed properties for Vue components
    get connectionStatus() {
        return computed(() => {
            if (this.isReconnecting.value) return 'reconnecting';
            if (this.isConnected.value) return 'connected';
            return 'disconnected';
        });
    }

    get statusMessage() {
        return computed(() => {
            if (this.isReconnecting.value) {
                return `Verbindung wird wiederhergestellt... (Versuch ${this.reconnectAttempts})`;
            }
            if (this.isConnected.value) {
                return 'Verbunden';
            }
            if (this.lastError.value) {
                return `Verbindungsfehler: ${this.lastError.value}`;
            }
            return 'Nicht verbunden';
        });
    }
}

// Singleton instance
export const websocketService = new WebSocketService();
export default websocketService;