<template>
  <div class="websocket-status">
    <!-- Connection Status Indicator -->
    <div class="flex items-center gap-2 text-sm">
      <div
        :class="{
          'w-2 h-2 rounded-full': true,
          'bg-green-500': connectionStatus === 'connected',
          'bg-yellow-500 animate-pulse': connectionStatus === 'reconnecting',
          'bg-red-500': connectionStatus === 'disconnected'
        }"
      ></div>
      <span class="text-gray-600">{{ statusMessage }}</span>
    </div>
    <!-- Error Display -->
    <div v-if="lastError" class="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
      {{ lastError }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useWebSocket, useFamilyWebSocket, useChildrenWebSocket, useTrackablesWebSocket } from '@/composables/useWebSocket';
// Get WebSocket composables
const {
  connectionStatus,
  statusMessage,
  lastError
} = useWebSocket();
const familySocket = useFamilyWebSocket();
const childrenSocket = useChildrenWebSocket();
const trackablesSocket = useTrackablesWebSocket();
// Event handlers
let unsubscribeFunctions: Array<() => void> = [];
onMounted(() => {
  // Subscribe to family events
  unsubscribeFunctions.push(
    familySocket.onFamilyUpdated(() => {
      // Refresh family data in your store
      // familyStore.refreshFamily(data.familyId);
    })
  );
  unsubscribeFunctions.push(
    familySocket.onMemberJoined(() => {
      // Show notification or update UI
      // notificationStore.showSuccess(`${data.userName} ist der Familie beigetreten`);
    })
  );
  unsubscribeFunctions.push(
    familySocket.onMemberLeft(() => {
      // Show notification
      // notificationStore.showInfo(`Ein Mitglied hat die Familie verlassen`);
    })
  );
  // Subscribe to children events
  unsubscribeFunctions.push(
    childrenSocket.onChildCreated(() => {
      // Refresh children list
      // childrenStore.refreshChildren();
    })
  );
  unsubscribeFunctions.push(
    childrenSocket.onChildUpdated(() => {
      // Update specific child in store
      // childrenStore.updateChild(data.child);
    })
  );
  // Subscribe to trackable events
  unsubscribeFunctions.push(
    trackablesSocket.onTrackableCreated(() => {
      // Refresh trackables for the child
      // trackablesStore.refreshTrackables(data.childId);
    })
  );
  unsubscribeFunctions.push(
    trackablesSocket.onTrackableUpdated(() => {
      // Update specific trackable
      // trackablesStore.updateTrackable(data.trackable);
    })
  );
  unsubscribeFunctions.push(
    trackablesSocket.onTrackableDeleted(() => {
      // Remove trackable from store
      // trackablesStore.removeTrackable(data.trackableId);
    })
  );
});
onUnmounted(() => {
  // Clean up all subscriptions
  unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
});
</script>
<style scoped>
.websocket-status {
  /* Add your styling here */
}
</style>
