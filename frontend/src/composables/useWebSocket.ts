import { onMounted, onUnmounted } from 'vue';
import websocketService, { type WebSocketEvent } from '@/services/websocket.service';
import { useAuthStore } from '@/stores/auth.store';
export function useWebSocket() {
    const authStore = useAuthStore();
    // Auto-connect when user is authenticated
    onMounted(() => {
        if (authStore.isAuthenticated && authStore.token) {
            websocketService.connect();
        }
    });
    // Clean up on unmount
    onUnmounted(() => {
        // Don't disconnect here as other components might be using it
        // The service manages its own lifecycle
    });
    const subscribe = (event: string, handler: (data: any) => void) => {
        websocketService.on(event, handler);
        // Return unsubscribe function
        return () => websocketService.off(event, handler);
    };
    const joinFamily = (familyId: string) => {
        websocketService.joinFamily(familyId);
    };
    return {
        isConnected: websocketService.isConnected,
        isReconnecting: websocketService.isReconnecting,
        connectionStatus: websocketService.connectionStatus,
        statusMessage: websocketService.statusMessage,
        lastError: websocketService.lastError,
        subscribe,
        joinFamily
    };
}
// Specific composables for different data types
export function useFamilyWebSocket() {
    const { subscribe } = useWebSocket();
    const onFamilyUpdated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('family.updated', handler);
    };
    const onMemberJoined = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('family.member.joined', handler);
    };
    const onMemberLeft = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('family.member.left', handler);
    };
    const onMemberUpdated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('family.member.updated', handler);
    };
    const onMemberRemoved = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('family.member.removed', handler);
    };
    return {
        onFamilyUpdated,
        onMemberJoined,
        onMemberLeft,
        onMemberUpdated,
        onMemberRemoved
    };
}
export function useChildrenWebSocket() {
    const { subscribe } = useWebSocket();
    const onChildCreated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('child.created', handler);
    };
    const onChildUpdated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('child.updated', handler);
    };
    return {
        onChildCreated,
        onChildUpdated
    };
}
export function useTrackablesWebSocket() {
    const { subscribe } = useWebSocket();
    const onTrackableCreated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('trackable.created', handler);
    };
    const onTrackableUpdated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('trackable.updated', handler);
    };
    const onTrackableDeleted = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('trackable.deleted', handler);
    };
    return {
        onTrackableCreated,
        onTrackableUpdated,
        onTrackableDeleted
    };
}
export function useEventsWebSocket() {
    const { subscribe } = useWebSocket();
    const onEventCreated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('event.created', handler);
    };
    const onEventUpdated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('event.updated', handler);
    };
    const onEventDeleted = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('event.deleted', handler);
    };
    const onMilestoneCreated = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('event.milestone.created', handler);
    };
    const onMilestoneDeleted = (handler: (data: WebSocketEvent) => void) => {
        return subscribe('event.milestone.deleted', handler);
    };
    return {
        onEventCreated,
        onEventUpdated,
        onEventDeleted,
        onMilestoneCreated,
        onMilestoneDeleted
    };
}
