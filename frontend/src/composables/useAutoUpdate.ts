import { onMounted, onUnmounted, ref, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { useTrackablesWebSocket, useEventsWebSocket } from './useWebSocket';
import type { WebSocketEvent } from '@/services/websocket.service';

/**
 * Composable to automatically update component data when trackable entities are created, updated, or deleted.
 * 
 * @param options Configuration options for auto-update
 * @returns Functions and reactive data for handling auto-updates
 */
export function useAutoUpdate(options: {
  childId?: string | Ref<string | undefined> | ComputedRef<string | undefined>;
  familyId?: string | Ref<string | undefined> | ComputedRef<string | undefined>;
  refreshFn: () => Promise<void> | void;
  filterFn?: (event: WebSocketEvent) => boolean;
}) {
  const { childId, familyId, refreshFn, filterFn } = options;
  
  // Track if an update is in progress to prevent multiple simultaneous refreshes
  const isUpdating = ref(false);
  
  // Get trackable and event WebSocket handlers
  const { onTrackableCreated, onTrackableUpdated, onTrackableDeleted } = useTrackablesWebSocket();
  const { onEventCreated, onEventUpdated, onEventDeleted, onMilestoneCreated, onMilestoneDeleted } = useEventsWebSocket();
  
  // Store unsubscribe functions to clean up on unmount
  const unsubscribeFunctions: Array<() => void> = [];
  
  // Resolve childId and familyId values, handling refs and computed props
  const resolvedChildId = computed(() => {
    if (!childId) return undefined;
    if (typeof childId === 'string') return childId;
    if ('value' in childId) return childId.value;
    return undefined;
  });

  const resolvedFamilyId = computed(() => {
    if (!familyId) return undefined;
    if (typeof familyId === 'string') return familyId;
    if ('value' in familyId) return familyId.value;
    return undefined;
  });

  // Default filter function if none provided
  const defaultFilterFn = (event: WebSocketEvent): boolean => {
    const currentChildId = resolvedChildId.value;
    const currentFamilyId = resolvedFamilyId.value;

    // If childId is specified, only refresh for events related to this child
    if (currentChildId && event.childId && event.childId !== currentChildId) {
      return false;
    }
    
    // If familyId is specified, only refresh for events related to this family
    if (currentFamilyId && event.familyId && event.familyId !== currentFamilyId) {
      return false;
    }

    return true;
  };
  
  // The actual filter function to use
  const effectiveFilterFn = filterFn || defaultFilterFn;
  
  // Function to handle trackable events
  const handleTrackableEvent = async (event: WebSocketEvent) => {
    
    // Check if this event is relevant for this component
    if (!effectiveFilterFn(event)) {
      return;
    }
    
    // Prevent multiple simultaneous refreshes
    if (isUpdating.value) {
      return;
    }
    
    try {
      isUpdating.value = true;
      await refreshFn();
    } catch (error) { } finally {
      isUpdating.value = false;
    }
  };
  
  // Set up event subscriptions on component mount
  onMounted(() => {
    // Subscribe to trackable events
    unsubscribeFunctions.push(
      onTrackableCreated(handleTrackableEvent)
    );
    
    unsubscribeFunctions.push(
      onTrackableUpdated(handleTrackableEvent)
    );
    
    unsubscribeFunctions.push(
      onTrackableDeleted(handleTrackableEvent)
    );
    
    // Subscribe to event events
    unsubscribeFunctions.push(
      onEventCreated(handleTrackableEvent)
    );
    
    unsubscribeFunctions.push(
      onEventUpdated(handleTrackableEvent)
    );
    
    unsubscribeFunctions.push(
      onEventDeleted(handleTrackableEvent)
    );
    
    // Subscribe to milestone events
    unsubscribeFunctions.push(
      onMilestoneCreated(handleTrackableEvent)
    );
    
    unsubscribeFunctions.push(
      onMilestoneDeleted(handleTrackableEvent)
    );
  });
  
  // Clean up subscriptions on component unmount
  onUnmounted(() => {
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  });
  
  // Function to manually trigger a refresh
  const refresh = async () => {
    if (isUpdating.value) {
      return;
    }
    
    try {
      isUpdating.value = true;
      await refreshFn();
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      isUpdating.value = false;
    }
  };
  
  return {
    isUpdating,
    refresh
  };
}

/**
 * Specialized version of useAutoUpdate for child components.
 * Automatically updates when trackable events related to the specified child are received.
 * 
 * @param childId The ID of the child to watch for updates (can be a ref or computed)
 * @param refreshFn Function to call to refresh the component's data
 * @returns Functions and reactive data for handling auto-updates
 */
export function useChildAutoUpdate(
  childId: string | Ref<string | undefined> | ComputedRef<string | undefined>,
  refreshFn: () => Promise<void> | void
) {
  // Track number of updates for debugging
  const updateCount = ref(0);
  
  // Get the actual childId value, handling refs and computed props
  const resolvedChildId = computed(() => {
    if (typeof childId === 'string') {
      return childId;
    } else if ('value' in childId) {
      return childId.value;
    }
    return undefined;
  });
  
  // Use the base useAutoUpdate with child-specific configuration
  const { isUpdating, refresh } = useAutoUpdate({
    childId: resolvedChildId.value,
    refreshFn: async () => {
      await refreshFn();
      updateCount.value++;
    },
    // Only refresh for events related to this child
    filterFn: (event: WebSocketEvent) => {
      const currentChildId = resolvedChildId.value;
      
      // Skip if we don't have a valid childId
      if (!currentChildId) {
        return false;
      }
      
      // For trackable events, check if they're related to this child
      if (event.childId) {
        return event.childId === currentChildId;
      }
      
      // For child events, check if they're about this child
      if (event.type?.startsWith('child.') && event.child?.id) {
        return event.child.id === currentChildId;
      }
      
      // For event events, check if they're related to this child
      if (event.type?.startsWith('event.') && event.childId) {
        return event.childId === currentChildId;
      }
      
      return false;
    }
  });
  
  return {
    isUpdating,
    updateCount,
    refresh
  };
}