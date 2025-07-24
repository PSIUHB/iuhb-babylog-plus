import websocketService from './websocket.service';
import { useAuthStore } from '@/stores/auth.store';
import { useFamilyStore } from '@/stores/family.store';
/**
 * Centralized WebSocket event handler that automatically updates stores
 * when entities are created, updated, or deleted via WebSocket events.
 */
class WebSocketUpdateService {
    private isInitialized = false;
    private unsubscribeFunctions: Array<() => void> = [];
    constructor() {
        // Auto-initialize when auth store is available
        setTimeout(() => {
            const authStore = useAuthStore();
            if (authStore.isAuthenticated) {
                this.initialize();
            }
        }, 200);
    }
    initialize() {
        if (this.isInitialized) {
            console.warn('WebSocketUpdateService already initialized');
            return;
        }
        this.setupEventHandlers();
        this.isInitialized = true;
    }
    destroy() {
        this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        this.unsubscribeFunctions = [];
        this.isInitialized = false;
    }
    private setupEventHandlers() {
        // Family Events
        websocketService.on('family.updated', (data) => {
            this.handleFamilyUpdated(data);
        });
        websocketService.on('family.member.joined', (data) => {
            this.handleFamilyMemberChanged(data);
        });
        websocketService.on('family.member.left', (data) => {
            this.handleFamilyMemberChanged(data);
        });
        websocketService.on('family.member.updated', (data) => {
            this.handleFamilyMemberChanged(data);
        });
        websocketService.on('family.member.removed', (data) => {
            this.handleFamilyMemberChanged(data);
        });
        // Child Events
        websocketService.on('child.created', (data) => {
            this.handleChildChanged(data);
        });
        websocketService.on('child.updated', (data) => {
            this.handleChildChanged(data);
        });
        // Trackable Events
        websocketService.on('trackable.created', (data) => {
            this.handleTrackableChanged(data);
        });
        websocketService.on('trackable.updated', (data) => {
            this.handleTrackableChanged(data);
        });
        websocketService.on('trackable.deleted', (data) => {
            this.handleTrackableChanged(data);
        });
    }
    private async handleFamilyUpdated(data: any) {
        try {
            const familyStore = useFamilyStore();
            // Refresh the specific family if it's the current one
            if (familyStore.getCurrentFamilyId === data.familyId) {
                await familyStore.setCurrentFamilyById(data.familyId);
            }
            // Also refresh the families list to ensure consistency
            await familyStore.fetchFamilies();
            // Emit custom event for components that need to know
            this.emitUpdateEvent('family-updated', data);
        } catch (error) {
            console.error('Error handling family update:', error);
        }
    }
    private async handleFamilyMemberChanged(data: any) {
        try {
            const familyStore = useFamilyStore();
            // Refresh the family data to get updated member list
            if (familyStore.getCurrentFamilyId === data.familyId) {
                await familyStore.setCurrentFamilyById(data.familyId);
            }
            // Refresh families list to update member counts
            await familyStore.fetchFamilies();
            // Emit custom event for components
            this.emitUpdateEvent('family-members-changed', data);
        } catch (error) {
            console.error('Error handling family member change:', error);
        }
    }
    private async handleChildChanged(data: any) {
        try {
            const familyStore = useFamilyStore();
            // Refresh current family to get updated children list
            if (familyStore.getCurrentFamilyId === data.familyId) {
                await familyStore.setCurrentFamilyById(data.familyId);
            }
            // Emit custom event for child-specific components
            this.emitUpdateEvent('child-changed', {
                ...data,
                changeType: data.type // 'child.created' or 'child.updated'
            });
        } catch (error) {
            console.error('Error handling child change:', error);
        }
    }
    private async handleTrackableChanged(data: any) {
        try {
            // For trackables, we mainly need to notify specific components
            // since trackables are usually fetched per-child basis
            // Emit custom event for trackable components
            this.emitUpdateEvent('trackable-changed', {
                ...data,
                changeType: data.type // 'trackable.created', 'trackable.updated', or 'trackable.deleted'
            });
            // If we had a trackables store, we would refresh it here
            // For now, individual components can listen to the custom event
        } catch (error) {
            console.error('Error handling trackable change:', error);
        }
    }
    private emitUpdateEvent(eventName: string, data: any) {
        // Use native DOM events for cross-component communication
        const customEvent = new CustomEvent(`ws-update:${eventName}`, {
            detail: data
        });
        window.dispatchEvent(customEvent);
    }
    // Public methods for manual refresh triggers
    public async refreshFamily(familyId?: string) {
        const familyStore = useFamilyStore();
        const targetFamilyId = familyId || familyStore.getCurrentFamilyId;
        if (targetFamilyId) {
            await familyStore.setCurrentFamilyById(targetFamilyId);
        }
    }
    public async refreshFamilies() {
        const familyStore = useFamilyStore();
        await familyStore.fetchFamilies();
    }
    // Method to check if a specific family/child should be refreshed
    public shouldRefreshForUser(userId: string): boolean {
        const authStore = useAuthStore();
        return authStore.user?.id === userId;
    }
    public shouldRefreshForFamily(familyId: string): boolean {
        const familyStore = useFamilyStore();
        return familyStore.getCurrentFamilyId === familyId;
    }
}
// Singleton instance
export const webSocketUpdateService = new WebSocketUpdateService();
export default webSocketUpdateService;
