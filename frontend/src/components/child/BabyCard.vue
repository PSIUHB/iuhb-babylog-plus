<template>
	<div
		class="card shadow-lg border"
		:class="cardClasses"
	>
	<div class="shooting-star" v-for="index in 10" :key="index"></div>
  	<div class="card-body">
		<div class="flex items-center gap-4 mb-4">
			<Avatar
				:src="baby.avatarUrl"
				:name="baby.name"
				size="sm"
				:bgColor="baby.gender === 'female' ? '6366f1' : '0ea5e9'"
				:textColor="'ffffff'"
			/>
			<div>
				<h3 class="card-title" :class="titleClasses">
					{{ baby.name }}
					<div
						v-if="childStatus === 'sleeping'"
						class="badge"
						:class="statusBadgeClasses"
					>
						{{ childStatus }}
					</div>
				</h3>
            <p class="text-sm text-base-content/60 birthday">Born: {{ formatDate(baby.birthDate) }}</p>
			</div>
			 <div class="ml-auto flex items-center gap-2">
					<div class="dropdown dropdown-end">
						<div tabindex="0" role="button" class="btn btn-ghost btn-sm">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
							</svg>
						</div>
						<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
							<li v-for="action in quickActions" :key="action.id">
								<a @click="handleQuickAction(action)">
									{{ action.icon }} {{ action.label }}
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-sm">Last feeding:</span>
					<span class="text-sm font-semibold">{{ lastFeed ? formatTimeAgo(lastFeed.occurredAt) : 'No data' }}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm">Last sleep:</span>
					<span class="text-sm font-semibold">{{ lastSleep ? formatTimeAgo(lastSleep.occurredAt) : 'No data' }}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm">Last diaper:</span>
					<span class="text-sm font-semibold">{{ lastDiaper ? formatTimeAgo(lastDiaper.occurredAt) : 'No data' }}</span>
				</div>
			</div>
			<div class="card-actions justify-end mt-4">
				<button
					class="btn btn-base btn-sm"
					@click="openFeedModal"
				>
					🍼 Feed
				</button>
				<!-- Sleep button -->
				<button
					class="btn btn-base btn-sm"
					:class="{ 'btn-accent': childStatus === 'sleeping' }"
					@click="openSleepTrackingModal"
				>
					{{ childStatus === 'sleeping' ? '⏰ Wake' : '💤 Sleep' }}
				</button>
			</div>
		</div>
	</div>
	<!-- Trackable Modals -->
	<FeedModal ref="feedModal" :childId="baby.id" @created="handleTrackableCreated" />
 <SleepTrackingModal ref="sleepTrackingModal" :childId="baby.id" :childIsSleeping="childStatus === 'sleeping'" @created="handleTrackableCreated" @updated="handleTrackableCreated" />
	<DiaperModal ref="diaperModal" :childId="baby.id" @created="handleTrackableCreated" />
	<TemperatureModal ref="temperatureModal" :childId="baby.id" @created="handleTrackableCreated" />
	<WeightModal ref="weightModal" :childId="baby.id" @created="handleTrackableCreated" />
	<BathModal ref="bathModal" :childId="baby.id" @created="handleTrackableCreated" />
</template>
<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { TrackableType } from '@/enums/trackable-type.enum'
import { useChildAutoUpdate } from '@/composables/useAutoUpdate'
import { formatTimeAgo, formatDate, parseDate } from '@/utils/timeUtils'
import Avatar from '@/components/ui/Avatar.vue'
// Import trackable modal components
import FeedModal from '@/components/trackables/FeedModal.vue'
import SleepTrackingModal from '@/components/trackables/SleepTrackingModal.vue'
import DiaperModal from '@/components/trackables/DiaperModal.vue'
import TemperatureModal from '@/components/trackables/TemperatureModal.vue'
import WeightModal from '@/components/trackables/WeightModal.vue'
import BathModal from '@/components/trackables/BathModal.vue'
// Import trackable services
import feedsService from '@/services/feeds.service'
import sleepsService from '@/services/sleeps.service'
import diapersService from '@/services/diapers.service'
import childrenService from '@/services/children.service'
const props = defineProps({
	baby: {
		type: Object,
		required: true
	}
})
const emit = defineEmits(['action-selected', 'event-created'])
// Refs for trackable modals
const feedModal = ref(null)
const sleepTrackingModal = ref(null)
const diaperModal = ref(null)
const temperatureModal = ref(null)
const weightModal = ref(null)
const bathModal = ref(null)
// Reactive variables for latest trackable data
const lastFeed = ref(null)
const lastSleep = ref(null)
const lastDiaper = ref(null)
const childStatus = ref('awake') // Default status is awake
// Setup automatic updates via WebSocket for trackable changes
useChildAutoUpdate(
  computed(() => props.baby?.id),
  async () => {
    await fetchLatestTrackableData()
  }
)
// Fetch child's current status
const fetchChildStatus = async () => {
  if (!props.baby?.id) return
  try {
    const response = await childrenService.getChildStatus(props.baby.id)
    childStatus.value = response.status
  } catch (error) {
    childStatus.value = 'awake' // Default to awake if there's an error
  }
}
// Fetch latest trackable data
const fetchLatestTrackableData = async () => {
  if (!props.baby?.id) return
  try {
    // Fetch latest feed
    const feeds = await feedsService.findAll(props.baby.id)
    if (feeds && feeds.length > 0) {
      // Sort by occurredAt in descending order using parseDate for consistent timezone handling
      const sortedFeeds = [...feeds].sort((a, b) => {
        const dateA = parseDate(a.occurredAt)
        const dateB = parseDate(b.occurredAt)
        return dateB.getTime() - dateA.getTime()
      })
      lastFeed.value = sortedFeeds[0]
    }
    // Fetch latest sleep
    const sleeps = await sleepsService.findAll(props.baby.id)
    if (sleeps && sleeps.length > 0) {
      // Sort by occurredAt in descending order using parseDate for consistent timezone handling
      const sortedSleeps = [...sleeps].sort((a, b) => {
        const dateA = parseDate(a.occurredAt)
        const dateB = parseDate(b.occurredAt)
        return dateB.getTime() - dateA.getTime()
      })
      lastSleep.value = sortedSleeps[0]
    }
    // Fetch latest diaper
    const diapers = await diapersService.findAll(props.baby.id)
    if (diapers && diapers.length > 0) {
      // Sort by occurredAt in descending order using parseDate for consistent timezone handling
      const sortedDiapers = [...diapers].sort((a, b) => {
        const dateA = parseDate(a.occurredAt)
        const dateB = parseDate(b.occurredAt)
        return dateB.getTime() - dateA.getTime()
      })
      lastDiaper.value = sortedDiapers[0]
    }
    // Also fetch the child's current status
    await fetchChildStatus()
  } catch (error) {
    // Handle error silently
  }
}
// Watch for baby prop changes and refetch data
watch(() => props.baby?.id, (newId) => {
  if (newId) {
    fetchLatestTrackableData()
  }
}, { immediate: true })
onMounted(() => {
  fetchLatestTrackableData()
})
// Handle trackable creation (called by modals)
const handleTrackableCreated = (trackable) => {
  fetchLatestTrackableData()
  emit('event-created', trackable)
}
// Quick actions data
const quickActions = ref([
	{
		id: 1,
		icon: '🚼',
		label: 'Diaper',
		action: 'diaper',
		eventType: TrackableType.DIAPER
	},
	{
		id: 2,
		icon: '🌡️',
		label: 'Temperature',
		action: 'temperature',
		eventType: TrackableType.TEMPERATURE
	},
	{
		id: 3,
		icon: '⚖️',
		label: 'Weight',
		action: 'weight',
		eventType: TrackableType.WEIGHT
	},
	{
		id: 4,
		icon: '🏆',
		label: 'Milestones',
		action: 'milestones',
		eventType: TrackableType.MILESTONE
	}
])
// Methods to open trackable modals
const openFeedModal = () => {
  feedModal.value?.openModal()
}
// Open the sleep tracking modal
const openSleepTrackingModal = () => {
  sleepTrackingModal.value?.openModal()
}
const openDiaperModal = () => {
  diaperModal.value?.openModal()
}
const openTemperatureModal = () => {
  temperatureModal.value?.openModal()
}
const openWeightModal = () => {
  weightModal.value?.openModal()
}
const openBathModal = () => {
  bathModal.value?.openModal()
}
// Handle quick action selection
const handleQuickAction = async (action) => {
	// Emit the action for parent components to handle
	emit('action-selected', {
		action: action.action,
		baby: props.baby,
		timestamp: new Date()
	})
	// Open the appropriate modal based on the action type
	switch (action.eventType) {
		case TrackableType.DIAPER:
			openDiaperModal()
			break;
		case TrackableType.TEMPERATURE:
			openTemperatureModal()
			break;
		case TrackableType.MEDICINE:
			// Medicine modal not implemented yet
			break;
		case TrackableType.WEIGHT:
			openWeightModal()
			break;
		case TrackableType.ACTIVITY:
			if (action.action === 'bath') {
				openBathModal()
			} else {
				// Other activities not implemented yet
			}
			break;
		case TrackableType.MILESTONE:
			// Milestone modal handled by parent component
			break;
		default:
			// No specific handling for this action type
			break;
	}
}
const cardClasses = computed(() => {
	if(childStatus.value === 'sleeping') {
		return {
			'starry-night': true
		}
	} else {
		return {
			'bg-base-200 border-base-300': props.baby.gender === 'female',
			'bg-secondary-content border-secondary': props.baby.gender === 'male'
		}
	}
})
const titleClasses = computed(() => {
	return {
		'text-primary': props.baby.gender === 'female',
		'text-secondary': props.baby.gender === 'male'
	}
})
const statusBadgeClasses = computed(() => {
	return {
		'badge-primary': childStatus.value === 'awake',
		'badge-accent': childStatus.value === 'sleeping'
	}
})
</script>