<template>
	<div v-if="error" class="alert alert-error mb-6">
		{{ error }}
	</div>
	<div v-else class="stats stats-vertical lg:stats-horizontal bg-base-100 shadow-lg mb-6 w-full">
		<div class="stat">
			<div class="stat-figure text-primary">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<div class="stat-title">Today's Events</div>
			<div v-if="loading" class="stat-value">
				<span class="loading loading-spinner loading-sm"></span>
			</div>
			<div v-else class="stat-value text-primary">{{ stats.events }}</div>
			<div class="stat-desc">{{ stats.eventsDesc }}</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-secondary">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<div class="stat-title">Sleep Hours</div>
			<div v-if="loading" class="stat-value">
				<span class="loading loading-spinner loading-sm"></span>
			</div>
			<div v-else class="stat-value text-secondary">{{ stats.sleep }}h</div>
			<div class="stat-desc">{{ stats.sleepDesc }}</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-accent">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" />
				</svg>
			</div>
			<div class="stat-title">Active Caregivers</div>
			<div v-if="loading" class="stat-value">
				<span class="loading loading-spinner loading-sm"></span>
			</div>
			<div v-else class="stat-value text-accent">{{ stats.caregivers }}</div>
			<div class="stat-desc">{{ stats.caregiversDesc }}</div>
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
import { TrackableType } from '@/enums/trackable-type.enum'

const stats = ref({
	events: 0,
	eventsDesc: 'Loading...',
	sleep: 0,
	sleepDesc: 'Loading...',
	caregivers: 0,
	caregiversDesc: 'Loading...'
})

const loading = ref(false)
const error = ref(null)
const familyStore = useFamilyStore()

const currentFamilyId = computed(() => familyStore.getCurrentFamilyId)

// Fetch dashboard stats
const fetchStats = async () => {
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

      // Initialize array to hold all trackable items
      const allTrackables = []
      
      // Process each child
      for (const child of childrenResponse) {
        // Fetch feeds for the child
        const feeds = await feedsService.findAll(child.id)
        if (feeds && feeds.error) {
          console.warn(`Error fetching feeds for child ${child.id}: ${feeds.message}`)
        } else if (feeds && feeds.length > 0) {
          feeds.forEach(feed => {
            allTrackables.push({
              childId: child.id,
              type: TrackableType.FEEDING,
              data: feed.data,
              occurredAt: feed.occurredAt,
              createdAt: feed.createdAt || feed.occurredAt,
              createdBy: feed.createdByUserId
            })
          })
        }
        
        // Fetch sleeps for the child
        const sleeps = await sleepsService.findAll(child.id)
        if (sleeps && sleeps.error) {
          console.warn(`Error fetching sleeps for child ${child.id}: ${sleeps.message}`)
        } else if (sleeps && sleeps.length > 0) {
          sleeps.forEach(sleep => {
            allTrackables.push({
              childId: child.id,
              type: TrackableType.SLEEP,
              data: sleep.data,
              occurredAt: sleep.occurredAt,
              createdAt: sleep.createdAt || sleep.occurredAt,
              createdBy: sleep.createdByUserId
            })
          })
        }
        
        // Fetch diapers for the child
        const diapers = await diapersService.findAll(child.id)
        if (diapers && diapers.error) {
          console.warn(`Error fetching diapers for child ${child.id}: ${diapers.message}`)
        } else if (diapers && diapers.length > 0) {
          diapers.forEach(diaper => {
            allTrackables.push({
              childId: child.id,
              type: TrackableType.DIAPER,
              data: diaper.data,
              occurredAt: diaper.occurredAt,
              createdAt: diaper.createdAt || diaper.occurredAt,
              createdBy: diaper.createdByUserId
            })
          })
        }
        
        // Fetch temperatures for the child
        const temperatures = await temperaturesService.findAll(child.id)
        if (temperatures && temperatures.error) {
          console.warn(`Error fetching temperatures for child ${child.id}: ${temperatures.message}`)
        } else if (temperatures && temperatures.length > 0) {
          temperatures.forEach(temperature => {
            allTrackables.push({
              childId: child.id,
              type: TrackableType.TEMPERATURE,
              data: temperature.data,
              occurredAt: temperature.occurredAt,
              createdAt: temperature.createdAt || temperature.occurredAt,
              createdBy: temperature.createdByUserId
            })
          })
        }
        
        // Fetch weights for the child
        const weights = await weightsService.findAll(child.id)
        if (weights && weights.error) {
          console.warn(`Error fetching weights for child ${child.id}: ${weights.message}`)
        } else if (weights && weights.length > 0) {
          weights.forEach(weight => {
            allTrackables.push({
              childId: child.id,
              type: TrackableType.WEIGHT,
              data: weight.data,
              occurredAt: weight.occurredAt,
              createdAt: weight.createdAt || weight.occurredAt,
              createdBy: weight.createdByUserId
            })
          })
        }
      }

      // Calculate today's events
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEvents = allTrackables.filter(item => new Date(item.createdAt) >= today)

      // Calculate yesterday's events for comparison
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayEnd = new Date(today)
      const yesterdayEvents = allTrackables.filter(item => 
        new Date(item.createdAt) >= yesterday && 
        new Date(item.createdAt) < yesterdayEnd
      )

      // Calculate sleep hours
      let totalSleepMinutes = 0

      // For each child, find sleep cycles
      childrenResponse.forEach(child => {
        const childSleeps = allTrackables.filter(item => 
          item.type === TrackableType.SLEEP && 
          item.childId === child.id
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        // Calculate completed sleep cycles
        for (let i = 0; i < childSleeps.length - 1; i++) {
          const current = childSleeps[i]
          const next = childSleeps[i + 1]

          if (current.data && next.data && current.data.status === 'end' && next.data.status === 'start') {
            const sleepDuration = new Date(current.occurredAt) - new Date(next.occurredAt)
            totalSleepMinutes += sleepDuration / (1000 * 60)
          }
        }

        // Check if child is currently sleeping
        if (childSleeps.length > 0 && childSleeps[0].data && childSleeps[0].data.status === 'start') {
          const sleepStart = new Date(childSleeps[0].occurredAt)
          const now = new Date()
          const currentSleepDuration = (now - sleepStart) / (1000 * 60)
          totalSleepMinutes += currentSleepDuration
        }
      })

      // Count unique caregivers (users who created events)
      const uniqueCaregivers = new Set(allTrackables.map(item => item.createdBy))

      // Update stats
      stats.value = {
        events: todayEvents.length,
        eventsDesc: todayEvents.length > yesterdayEvents.length 
          ? `↗︎ ${todayEvents.length - yesterdayEvents.length} more than yesterday`
          : todayEvents.length < yesterdayEvents.length
            ? `↘︎ ${yesterdayEvents.length - todayEvents.length} less than yesterday`
            : 'Same as yesterday',
        sleep: (totalSleepMinutes / 60).toFixed(1),
        sleepDesc: `Combined for ${childrenResponse.length} ${childrenResponse.length === 1 ? 'baby' : 'babies'}`,
        caregivers: uniqueCaregivers.size,
        caregiversDesc: 'Currently active'
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      error.value = 'Failed to load stats'
    } finally {
      loading.value = false
    }
  }
}

// Use mock data when API fails
const useMockData = () => {
  stats.value = {
    events: 24,
    eventsDesc: '↗︎ 3 more than yesterday',
    sleep: 15.2,
    sleepDesc: 'Combined for both babies',
    caregivers: 3,
    caregiversDesc: 'Currently active'
  }
}

onMounted(async () => {
  await fetchStats()
})
</script>
