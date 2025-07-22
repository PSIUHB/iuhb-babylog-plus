<template>
	<div
		class="card shadow-lg border"
		:class="cardClasses"
	>
		<div class="card-body">
			<div class="flex items-center gap-4 mb-4">
				<div class="avatar">
					<div
						class="w-16 h-16 rounded-full flex items-center justify-center text-center leading-none"
						:class="avatarClasses"
					>
						<span class="text-2xl font-bold flex items-center justify-center w-full h-full">{{ baby.initial }}</span>
					</div>
				</div>
				<div>
					<h3 class="card-title" :class="titleClasses">{{ baby.name }}</h3>
					<p class="text-sm text-base-content/60">Born: {{ baby.birthDate }}</p>
				</div>
    <div class="ml-auto flex items-center gap-2">
					<div
						class="badge"
						:class="statusBadgeClasses"
					>
						{{ baby.status }}
					</div>
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
				<button
					class="btn btn-base btn-sm"
					@click="openSleepModal"
				>
					{{ baby.statusType === 'sleeping' ? '⏰ Wake' : '💤 Sleep' }}
				</button>
			</div>
		</div>
	</div>

	<!-- Trackable Modals -->
	<FeedModal ref="feedModal" :childId="baby.id" @created="handleTrackableCreated" />
	<SleepModal ref="sleepModal" :childId="baby.id" @created="handleTrackableCreated" />
	<DiaperModal ref="diaperModal" :childId="baby.id" @created="handleTrackableCreated" />
	<TemperatureModal ref="temperatureModal" :childId="baby.id" @created="handleTrackableCreated" />
	<WeightModal ref="weightModal" :childId="baby.id" @created="handleTrackableCreated" />
	<BathModal ref="bathModal" :childId="baby.id" @created="handleTrackableCreated" />
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { TrackableType } from '@/enums/trackable-type.enum'

// Import trackable modal components
import FeedModal from '@/components/trackables/FeedModal.vue'
import SleepModal from '@/components/trackables/SleepModal.vue'
import DiaperModal from '@/components/trackables/DiaperModal.vue'
import TemperatureModal from '@/components/trackables/TemperatureModal.vue'
import WeightModal from '@/components/trackables/WeightModal.vue'
import BathModal from '@/components/trackables/BathModal.vue'

// Import trackable services
import feedsService from '@/services/feeds.service'
import sleepsService from '@/services/sleeps.service'
import diapersService from '@/services/diapers.service'

const props = defineProps({
	baby: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['action-selected', 'event-created'])

// Refs for trackable modals
const feedModal = ref(null)
const sleepModal = ref(null)
const diaperModal = ref(null)
const temperatureModal = ref(null)
const weightModal = ref(null)
const bathModal = ref(null)

// Reactive variables for latest trackable data
const lastFeed = ref(null)
const lastSleep = ref(null)
const lastDiaper = ref(null)

// Format time ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'No data'
  
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

// Fetch latest trackable data
const fetchLatestTrackables = async () => {
  try {
    // Fetch all feeds for the child
    const feeds = await feedsService.findAll(props.baby.id)
    if (feeds && feeds.length > 0) {
      // Sort by occurredAt in descending order
      const sortedFeeds = [...feeds].sort((a, b) => 
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      )
      lastFeed.value = sortedFeeds[0]
    }

    // Fetch all sleeps for the child
    const sleeps = await sleepsService.findAll(props.baby.id)
    if (sleeps && sleeps.length > 0) {
      // Sort by occurredAt in descending order
      const sortedSleeps = [...sleeps].sort((a, b) => 
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      )
      lastSleep.value = sortedSleeps[0]
    }

    // Fetch all diapers for the child
    const diapers = await diapersService.findAll(props.baby.id)
    if (diapers && diapers.length > 0) {
      // Sort by occurredAt in descending order
      const sortedDiapers = [...diapers].sort((a, b) => 
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      )
      lastDiaper.value = sortedDiapers[0]
    }
  } catch (error) {
    console.error('Error fetching trackable data:', error)
  }
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
		icon: '💊',
		label: 'Medicine',
		action: 'medicine',
		eventType: TrackableType.MEDICINE
	},
	{
		id: 4,
		icon: '⚖️',
		label: 'Weight',
		action: 'weight',
		eventType: TrackableType.WEIGHT
	},
	{
		id: 5,
		icon: '🛁',
		label: 'Bath',
		action: 'bath',
		eventType: TrackableType.ACTIVITY
	},
	{
		id: 6,
		icon: '🎵',
		label: 'Tummy Time',
		action: 'activity',
		eventType: TrackableType.ACTIVITY
	},
	{
		id: 7,
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

const openSleepModal = () => {
  sleepModal.value?.openModal()
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

// Handle trackable created event
const handleTrackableCreated = (trackable) => {
  emit('event-created', trackable)
  // Refresh trackable data when a new one is created
  fetchLatestTrackables()
}

// Fetch data when component is mounted
onMounted(() => {
  fetchLatestTrackables()
})

// Fetch data when baby id changes
watch(() => props.baby.id, () => {
  fetchLatestTrackables()
})

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
			console.log('Medicine tracking not implemented yet')
			break;
			
		case TrackableType.WEIGHT:
			openWeightModal()
			break;
			
		case TrackableType.ACTIVITY:
			if (action.action === 'bath') {
				openBathModal()
			} else {
				// Other activities not implemented yet
				console.log('Activity tracking not implemented yet')
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
	return {
		'bg-base-200 border-base-300': props.baby.gender === 'female',
		'bg-secondary-content border-secondary': props.baby.gender === 'male'
	}
})

const avatarClasses = computed(() => {
	return {
		'bg-primary text-primary-content': props.baby.gender === 'female',
		'bg-secondary text-secondary-content': props.baby.gender === 'male'
	}
})

const titleClasses = computed(() => {
	return {
		'text-primary': props.baby.gender === 'female',
		'text-secondary': props.baby.gender === 'male'
	}
})

const statusBadgeClasses = computed(() => {
	const status = props.baby.statusType
	return {
		'badge-primary': status === 'awake',
		'badge-accent': status === 'sleeping'
	}
})
</script>