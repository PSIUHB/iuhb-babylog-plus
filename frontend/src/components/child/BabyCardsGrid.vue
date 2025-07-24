<template>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
		<div v-if="isUpdating" class="fixed top-4 right-4 alert alert-info shadow-lg z-50 w-auto">
			<div>
				<span class="loading loading-spinner loading-sm mr-2"></span>
				<span>Updating baby data...</span>
			</div>
		</div>
		<BabyCard
			v-for="baby in babies"
			:key="baby.id"
			:baby="baby"
			@action-selected="handleQuickAction"
			@event-created="handleEventCreated"
		/>
		<div class="flex items-center justify-center h-75 card bg-base-100 shadow-lg lg:col-span-2 text-base" v-if="babies.length === 0">
			You have no babies yet.<br><router-link to="/app/family"><a class="text-primary">Start by adding one!</a></router-link>
		</div>
	</div>
	<!-- Milestone Tracker Modal -->
	<MilestoneTrackerModal ref="milestoneModal" />
	<!-- Toast notification for event creation -->
	<div v-if="showToast" class="toast toast-top toast-end">
		<div class="alert alert-success">
			<span>{{ toastMessage }}</span>
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import BabyCard from './BabyCard.vue'
import childrenService from '@/services/children.service'
import { useFamilyStore } from '@/stores/family.store'
import MilestoneTrackerModal from '@/components/milestones/MilestoneTrackerModal.vue'
import { TrackableType } from '@/enums/trackable-type.enum'
import feedsService from '@/services/feeds.service'
import sleepsService from '@/services/sleeps.service'
import diapersService from '@/services/diapers.service'
import temperaturesService from '@/services/temperatures.service'
import weightsService from '@/services/weights.service'
import { useAutoUpdate } from '@/composables/useAutoUpdate'
const babies = ref([])
const loading = ref(false)
const error = ref(null)
const familyStore = useFamilyStore()
const milestoneModal = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
// Handle quick actions from BabyCard
const handleQuickAction = (actionData) => {
  if (actionData.action === 'milestones') {
    // Open the milestone tracker modal with the selected baby
    milestoneModal.value?.openModal(actionData.baby)
  }
  // Other actions are now handled directly in the BabyCard component
  // through the event system
}
// Handle event creation from BabyCard
const handleEventCreated = (event) => {
  // Show a toast notification
  let actionName = '';
  switch (event.type) {
    case TrackableType.FEEDING:
      actionName = 'Feeding';
      break;
    case TrackableType.DIAPER:
      actionName = 'Diaper change';
      break;
    case TrackableType.SLEEP:
      actionName = event.data.status === 'start' ? 'Sleep start' : 'Sleep end';
      break;
    case TrackableType.MEDICINE:
      actionName = 'Medicine';
      break;
    case TrackableType.TEMPERATURE:
      actionName = 'Temperature';
      break;
    case TrackableType.WEIGHT:
      actionName = 'Weight';
      break;
    case TrackableType.HEIGHT:
      actionName = 'Height';
      break;
    case TrackableType.ACTIVITY:
      actionName = event.data.name || 'Activity';
      break;
    case TrackableType.NOTE:
      actionName = 'Note';
      break;
    case TrackableType.MILESTONE:
      actionName = 'Milestone';
      break;
    default:
      actionName = 'Event';
  }
  toastMessage.value = `${actionName} recorded successfully!`;
  showToast.value = true;
  // Hide the toast after 3 seconds
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
  // Refresh the babies data to show the updated information
  fetchBabies();
}
const currentFamilyId = computed(() => familyStore.getCurrentFamilyId)
// Setup automatic updates via WebSocket
const { isUpdating } = useAutoUpdate({
  familyId: computed(() => currentFamilyId.value),
  refreshFn: async () => {
    await fetchBabies()
  }
})
// Format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.round(diffMs / (1000 * 60))
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else {
    return `${diffHours}h ${diffMins % 60}m ago`
  }
}
// Fetch babies and their trackable data
const fetchBabies = async () => {
  if (!currentFamilyId.value) {
    await familyStore.fetchFamilies()
  }
  if (currentFamilyId.value) {
    loading.value = true
    error.value = null
    try {
      // Fetch children for the current family
      const childrenResponse = await childrenService.getChildrenByFamily(currentFamilyId.value)
      // Check if the response is an error object
      if (childrenResponse && childrenResponse.error) {
        error.value = childrenResponse.message || 'Failed to load babies'
        return
      }
      // Initialize formatted babies array
      const formattedBabies = []
      // Process each child
      for (const child of childrenResponse) {
        // Fetch feeds for the child
        const feeds = await feedsService.findAll(child.id)
        if (feeds && feeds.error) {
          console.warn(`Error fetching feeds for child ${child.id}: ${feeds.message}`)
        }
        // Fetch sleeps for the child
        const sleeps = await sleepsService.findAll(child.id)
        if (sleeps && sleeps.error) {
          console.warn(`Error fetching sleeps for child ${child.id}: ${sleeps.message}`)
        }
        // Fetch diapers for the child
        const diapers = await diapersService.findAll(child.id)
        if (diapers && diapers.error) {
          console.warn(`Error fetching diapers for child ${child.id}: ${diapers.message}`)
        }
        // Format the baby data with the trackable information
        const formattedBaby = {
          id: child.id,
          name: child.firstName,
          initial: child.firstName.charAt(0),
          birthDate: child.birthDate,
          gender: child.gender,
          status: 'Awake', // Default status
          statusType: 'awake', // Default status type
          lastFeeding: null,
          sleepingSince: null,
          lastSleep: null,
          diaperChanges: 0
        }
        // Process feeds
        if (feeds && feeds.length > 0) {
          const sortedFeeds = [...feeds].sort((a, b) => 
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
          )
          formattedBaby.lastFeeding = formatTimeAgo(sortedFeeds[0].occurredAt)
        } else {
          formattedBaby.lastFeeding = 'No data'
        }
        // Process sleeps
        if (sleeps && sleeps.length > 0) {
          const sortedSleeps = [...sleeps].sort((a, b) => 
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
          )
          // Check if the baby is currently sleeping
          // A baby is sleeping if the most recent sleep entry has no endTime
          const isSleeping = sortedSleeps.length > 0 && sortedSleeps[0].data && !sortedSleeps[0].data.endTime
          formattedBaby.statusType = isSleeping ? 'sleeping' : 'awake'
          formattedBaby.status = isSleeping ? 'Sleeping' : 'Awake'
          if (isSleeping) {
            formattedBaby.sleepingSince = formatTimeAgo(sortedSleeps[0].occurredAt)
            formattedBaby.lastSleep = formattedBaby.sleepingSince
          } else if (sortedSleeps.length >= 2) {
            // Find the last complete sleep cycle
            const lastSleepEnd = sortedSleeps.find(s => s.data && s.data.status === 'end')
            if (lastSleepEnd) {
              formattedBaby.lastSleep = formatTimeAgo(lastSleepEnd.occurredAt)
            } else {
              formattedBaby.lastSleep = 'No data'
            }
          } else {
            formattedBaby.lastSleep = 'No data'
          }
        } else {
          formattedBaby.lastSleep = 'No data'
        }
        // Process diapers
        if (diapers && diapers.length > 0) {
          const sortedDiapers = [...diapers].sort((a, b) => 
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
          )
          formattedBaby.lastDiaper = formatTimeAgo(sortedDiapers[0].occurredAt)
          // Count diaper changes today
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const diaperChangesToday = diapers.filter(d => new Date(d.occurredAt) >= today)
          formattedBaby.diaperChanges = diaperChangesToday.length
        } else {
          formattedBaby.lastDiaper = 'No data'
        }
        formattedBabies.push(formattedBaby)
      }
      // Update the babies ref
      babies.value = formattedBabies
    } catch (err) {
      console.error('Error fetching babies:', err)
      error.value = 'Failed to load babies'
    } finally {
      loading.value = false
    }
  }
}
onMounted(async () => {
  await fetchBabies()
})
</script>
