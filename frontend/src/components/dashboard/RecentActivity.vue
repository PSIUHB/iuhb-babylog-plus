<template>
	<div class="card bg-base-100 shadow-lg lg:col-span-2">
		<div class="card-body">
			<h3 class="card-title mb-4">Recent Activity</h3>
			<div v-if="loading" class="flex justify-center items-center py-4">
				<span class="loading loading-spinner loading-md"></span>
			</div>
			<div v-else-if="error" class="alert alert-error">
				{{ error }}
			</div>
			<div v-else class="space-y-3 max-h-48 overflow-y-auto">
				<div
					v-for="(activity, index) in activities"
					:key="index"
					class="flex items-center gap-3 p-3 rounded-lg"
					:class="activity.colorClass"
				>
					<div
						class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
						:class="activity.avatarClass"
					>
						{{ activity.initial }}
					</div>
					<div class="flex-1">
						<div class="text-sm font-semibold">{{ activity.baby }}</div>
						<div class="text-sm text-base-content/70">{{ activity.action }}</div>
					</div>
					<div class="text-xs text-base-content/50">{{ activity.time }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import childrenService from '@/services/children.service'
import { useFamilyStore } from '@/stores/family.store'
import feedsService from '@/services/feeds.service'
import sleepsService from '@/services/sleeps.service'
import diapersService from '@/services/diapers.service'
import temperaturesService from '@/services/temperatures.service'
import weightsService from '@/services/weights.service'
import milestoneService from '@/services/milestones.service'
import { useAutoUpdate } from '@/composables/useAutoUpdate'

const activities = ref([])
const loading = ref(false)
const error = ref(null)
const familyStore = useFamilyStore()
const childrenMap = ref({})

const currentFamilyId = computed(() => familyStore.getCurrentFamilyId)

// Setup automatic updates via WebSocket
const { isUpdating: isAutoUpdating } = useAutoUpdate({
  familyId: computed(() => currentFamilyId.value),
  refreshFn: async () => {
    console.log('Recent activity data changed via WebSocket, refreshing...')
    await fetchActivities()
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
  } else if (diffHours < 24) {
    return `${diffHours}h ${diffMins % 60}m ago`
  } else {
    return `${Math.floor(diffHours / 24)}d ago`
  }
}

import { TrackableType } from '@/enums/trackable-type.enum'

// Format event action
const formatEventAction = (event) => {
  // Extract data from event - ensure we have a data object even if it's undefined
  const data = event.data || {};

  console.log(event);

  switch (event.type) {
    case TrackableType.FEEDING:
      return `Fed ${data.method ? ' - ' + data.method : ''} ${data.amount_ml ? `(${data.amount_ml}ml)` : ''}`
    
    case TrackableType.SLEEP:
      return data.status === 'start' 
        ? 'Started sleeping' 
        : `Woke up ${data.duration_minutes ? `after ${data.duration_minutes} minutes` : 'from nap'}`
    
    case TrackableType.DIAPER:
      return `Diaper changed ${data.type ? ' - ' + data.type : ''}`
    
    case TrackableType.TEMPERATURE:
      return `Temperature recorded: ${data.value || ''}${data.unit === 'fahrenheit' ? '°F' : '°C'}`
    
    case TrackableType.MEDICINE:
      return `Medicine given: ${data.name || ''} (${data.dosage || ''} ${data.unit || ''})`
    
    case TrackableType.WEIGHT:
      return `Weight recorded: ${data.value || ''}${data.unit ? ` ${data.unit}` : 'kg'}`
    
    case TrackableType.HEIGHT:
      return `Height recorded: ${data.value || ''}${data.unit ? ` ${data.unit}` : 'cm'}`
    
    case TrackableType.ACTIVITY:
      return `${data.name || 'Activity'} ${data.duration_minutes ? `for ${data.duration_minutes} minutes` : 'completed'}`
    
    case TrackableType.NOTE:
      return `Note: ${data.title || data.content?.substring(0, 20) || 'Added'}`
    
    case TrackableType.MILESTONE:
      return `Milestone achieved: ${data.milestone || ''}`
    
    default:
      return event.type.replace('_', ' ')
  }
}


// Fetch recent activities
const fetchActivities = async () => {
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
        error.value = childrenResponse.message || 'Failed to load children data'
        return
      }

      // Create a map of child IDs to names
      childrenMap.value = childrenResponse.reduce((map, child) => {
        map[child.id] = {
          name: child.firstName,
          initial: child.firstName.charAt(0),
          gender: child.gender
        }
        return map
      }, {})

      // Initialize array to hold all activities
      const allActivities = []

      // Process each child
      for (const child of childrenResponse) {
        // Fetch feeds for the child
        const feeds = await feedsService.findAll(child.id)
        if (feeds && feeds.length > 0) {
          feeds.forEach(feed => {
            allActivities.push({
              childId: child.id,
              type: TrackableType.FEEDING,
              data: feed,
              occurredAt: feed.occurredAt,
              createdAt: feed.createdAt || feed.occurredAt
            })
          })
        }
        
        // Fetch sleeps for the child
        const sleeps = await sleepsService.findAll(child.id)
        if (sleeps && sleeps.length > 0) {
          sleeps.forEach(sleep => {
            allActivities.push({
              childId: child.id,
              type: TrackableType.SLEEP,
              data: sleep,
              occurredAt: sleep.occurredAt,
              createdAt: sleep.createdAt || sleep.occurredAt
            })
          })
        }
        
        // Fetch diapers for the child
        const diapers = await diapersService.findAll(child.id)
        if (diapers && diapers.length > 0) {
          diapers.forEach(diaper => {
            allActivities.push({
              childId: child.id,
              type: TrackableType.DIAPER,
              data: diaper,
              occurredAt: diaper.occurredAt,
              createdAt: diaper.createdAt || diaper.occurredAt
            })
          })
        }
        
        // Fetch temperatures for the child
        const temperatures = await temperaturesService.findAll(child.id)
        if (temperatures && temperatures.length > 0) {
          temperatures.forEach(temperature => {
            allActivities.push({
              childId: child.id,
              type: TrackableType.TEMPERATURE,
              data: temperature,
              occurredAt: temperature.occurredAt,
              createdAt: temperature.createdAt || temperature.occurredAt
            })
          })
        }
        
        // Fetch weights for the child
        const weights = await weightsService.findAll(child.id)
        if (weights && weights.length > 0) {
          weights.forEach(weight => {
            allActivities.push({
              childId: child.id,
              type: TrackableType.WEIGHT,
              data: weight,
              occurredAt: weight.occurredAt,
              createdAt: weight.createdAt || weight.occurredAt
            })
          })
        }
        
        // Fetch milestones for the child
        try {
          const milestones = await milestoneService.getMilestones(child.id)
          if (milestones && milestones.length > 0) {
            milestones.forEach(milestone => {
              allActivities.push({
                childId: child.id,
                type: TrackableType.MILESTONE,
                data: milestone,
                occurredAt: milestone.achievedDate || milestone.occurredAt,
                createdAt: milestone.createdAt || milestone.occurredAt
              })
            })
          }
        } catch (err) {
          console.error('Error fetching milestones:', err)
          // Continue with other activities even if milestones fail
        }
      }

      // Sort all activities by createdAt in descending order
      allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      // Take only the 10 most recent activities
      const recentActivities = allActivities.slice(0, 10)

      // Format the activities for display
      activities.value = recentActivities.map(activity => {
        const child = childrenMap.value[activity.childId]
        const colorTheme = child?.gender === 'female' ? 'primary' : 'secondary'

        return {
          baby: child?.name || 'Unknown',
          initial: child?.initial || '?',
          action: formatEventAction(activity),
          time: formatTimeAgo(activity.createdAt),
          colorClass: colorTheme === 'primary' ? 'bg-primary/5' : 'bg-secondary/5',
          avatarClass: colorTheme === 'primary' 
            ? 'bg-primary text-primary-content' 
            : 'bg-secondary text-secondary-content'
        }
      })
    } catch (err) {
      console.error('Error fetching activities:', err)
      error.value = 'Failed to load activities'
    } finally {
      loading.value = false
    }
  }
}

onMounted(async () => {
  await fetchActivities()
})
</script>

<style scoped>
/* Custom scrollbar for activity feed */
.overflow-y-auto::-webkit-scrollbar {
	width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
	background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
	background: hsl(var(--bc) / 0.2);
	border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
	background: hsl(var(--bc) / 0.3);
}
</style>
