<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
		   <div class="flex justify-between items-center mb-4">
					<h3 class="card-title">Sleep Patterns (24h)</h3>
					<HelpButton @open-help-modal="openHelpModal" />
				</div>
					<div v-if="loading || isUpdating" class="flex justify-center items-center py-4">
						<span class="loading loading-spinner loading-md"></span>
						<span v-if="isUpdating" class="ml-2 text-sm text-base-content/70">Updating...</span>
					</div>
					<div v-else-if="error" class="alert alert-error">
						{{ error }}
					</div>
					<div v-else>
						<div class="space-y-3">
							<div
								v-for="baby in sleepData"
								:key="baby.name"
							>
								<div class="flex justify-between items-center mb-2">
									<div class="flex items-center gap-2">
										<span
											class="text-sm font-semibold"
											:class="baby.textColor"
										>
											{{ baby.name }}
										</span>
										<div
											class="badge badge-sm"
											:class="getQualityBadgeClass(baby.quality)"
										>
											{{ getQualityLabel(baby.quality) }}
										</div>
									</div>
									<span class="text-sm">{{ baby.totalSleep }} total</span>
								</div>
								<progress
									class="progress w-full"
									:class="baby.progressClass"
									:value="baby.percentage"
									max="100"
								></progress>
							</div>
						</div>
					</div>
				</div>
		 </div>
	<!-- Help Modal -->
	<HelpModal ref="helpModal" title="Understanding Sleep Patterns">
		<div>
			<h4 class="font-semibold mb-2">About the Chart</h4>
			<p>This chart shows sleep patterns for each child over the last 24 hours. The progress bar indicates the percentage of recommended sleep achieved (based on 16 hours for infants).</p>
		</div>
		<div>
			<h4 class="font-semibold mb-2">Sleep Quality Badges</h4>
			<p>Each child has a quality badge that indicates their sleep quality:</p>
			<ul class="list-disc list-inside ml-4 mt-2 space-y-2">
				<li>
					<span class="badge badge-sm badge-success">Good</span>
					<span class="ml-2">Long sleep cycles (60+ minutes) indicating deep, restful sleep</span>
				</li>
				<li>
					<span class="badge badge-sm badge-info">Fair</span>
					<span class="ml-2">Medium sleep cycles (30-60 minutes) indicating moderate quality sleep</span>
				</li>
				<li>
					<span class="badge badge-sm badge-warning">Poor</span>
					<span class="ml-2">Short sleep cycles (less than 30 minutes) indicating restless sleep</span>
				</li>
				<li>
					<span class="badge badge-sm badge-neutral">Unknown</span>
					<span class="ml-2">Not enough data to determine sleep quality</span>
				</li>
			</ul>
		</div>
		<div>
			<h4 class="font-semibold mb-2">How It's Calculated</h4>
			<p>Sleep quality is determined by analyzing the average length of completed sleep cycles. Longer cycles typically indicate better quality sleep for babies.</p>
		</div>
	</HelpModal>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import childrenService from '@/services/children.service'
import { useFamilyStore } from '@/stores/family.store'
import sleepsService from '@/services/sleeps.service'
import { SleepQuality } from '@/interfaces/trackable.interface'
import HelpModal from '@/components/global/HelpModal.vue'
import HelpButton from '@/components/global/HelpButton.vue'
import { useAutoUpdate } from '@/composables/useAutoUpdate'
import { parseDate, getDateDifference } from '@/utils/timeUtils'
const sleepData = ref([])
const loading = ref(false)
const error = ref(null)
const helpModal = ref(null)
const familyStore = useFamilyStore()
// Modal functions
const openHelpModal = () => {
  helpModal.value?.openModal()
}
const closeHelpModal = () => {
  helpModal.value?.closeModal()
}
const currentFamilyId = computed(() => familyStore.getCurrentFamilyId)
// Setup automatic updates via WebSocket
const { isUpdating } = useAutoUpdate({
  familyId: computed(() => currentFamilyId.value),
  refreshFn: async () => {
    await fetchSleepData()
  }
})
// Format minutes to hours and minutes
const formatSleepDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  return `${hours}h ${remainingMinutes}m`
}
// Get child color theme
const getChildColorTheme = (childId) => {
  return parseInt(childId) % 2 === 0 ? 'secondary' : 'primary'
}
// Calculate sleep quality
const calculateSleepQuality = (sleepCycles, totalSleepMinutes) => {
  // This is a simplified algorithm - in a real app, you'd have more sophisticated logic
  // If there are no sleep cycles but there is sleep time, we can still determine quality
  if (sleepCycles === 0) {
    if (totalSleepMinutes === 0) return 'Unknown'
    // For ongoing sleep with no completed cycles, use duration-based quality
    if (totalSleepMinutes < 30) return SleepQuality.POOR
    if (totalSleepMinutes < 60) return SleepQuality.FAIR
    return SleepQuality.GOOD
  }
  // Calculate average sleep cycle length
  const avgCycleLength = totalSleepMinutes / sleepCycles
  // Babies typically need longer sleep cycles
  if (avgCycleLength < 30) return SleepQuality.POOR // Very short cycles
  if (avgCycleLength < 60) return SleepQuality.FAIR // Short cycles
  return SleepQuality.GOOD // Good length cycles
}
// Get quality badge class based on quality value
const getQualityBadgeClass = (quality) => {
  switch (quality) {
    case SleepQuality.GOOD:
      return 'badge-success'
    case SleepQuality.FAIR:
      return 'badge-info'
    case SleepQuality.POOR:
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}
// Get quality label based on quality value
const getQualityLabel = (quality) => {
  switch (quality) {
    case SleepQuality.GOOD:
      return 'Good'
    case SleepQuality.FAIR:
      return 'Fair'
    case SleepQuality.POOR:
      return 'Poor'
    default:
      return 'Unknown'
  }
}
// Fetch sleep data
const fetchSleepData = async () => {
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
      // No need to fetch all events at once - we'll fetch sleeps for each child
      // Calculate sleep data for each child
      const sleepStats = []
      // Get events from the last 24 hours using consistent timezone handling
      const oneDayAgo = new Date()
      oneDayAgo.setHours(oneDayAgo.getHours() - 24)
      for (const child of childrenResponse) {
        const colorTheme = getChildColorTheme(child.id)
        // Fetch sleeps for the child
        const sleeps = await sleepsService.findAll(child.id)
        // Check if the response is an error object
        if (sleeps && sleeps.error) {
          console.warn(`Error fetching sleeps for child ${child.id}: ${sleeps.message}`)
          continue
        }
        // Filter sleeps from the last 24 hours using parseDate for consistent timezone handling
        const recentSleeps = sleeps && sleeps.length > 0
          ? sleeps.filter(sleep => {
              const sleepDate = parseDate(sleep.occurredAt)
              return sleepDate && sleepDate >= oneDayAgo
            })
          : []
        // Sort sleeps by occurredAt in ascending order using parseDate for consistent timezone handling
        const sortedSleeps = [...recentSleeps].sort((a, b) => {
          const dateA = parseDate(a.occurredAt)
          const dateB = parseDate(b.occurredAt)
          return dateA.getTime() - dateB.getTime()
        })
        let totalSleepMinutes = 0
        let sleepCycles = 0
        // Calculate completed sleep cycles using getDateDifference for consistent timezone handling
        for (let i = 0; i < sortedSleeps.length; i++) {
          const sleep = sortedSleeps[i]
          // Handle new format: single entries with both startTime and endTime
          if (sleep.startTime && sleep.endTime) {
            // Use getDateDifference to calculate minutes between dates
            const sleepMinutes = getDateDifference(sleep.startTime, sleep.endTime, 'minutes')
            if (sleepMinutes !== null && sleepMinutes > 0) {
              totalSleepMinutes += sleepMinutes
              sleepCycles++
            }
          }
        }
        // Check if child is currently sleeping
        const lastSleep = sortedSleeps.length > 0 ? sortedSleeps[sortedSleeps.length - 1] : null
        // Check for new format: entry with startTime but no endTime (currently sleeping)
        if (lastSleep && lastSleep.startTime && !lastSleep.endTime) {
          const sleepStart = parseDate(lastSleep.startTime)
          const now = new Date()
          if (sleepStart) {
            // Use getDateDifference to calculate minutes between dates
            const currentSleepMinutes = getDateDifference(sleepStart, now, 'minutes')
            if (currentSleepMinutes !== null && currentSleepMinutes > 0) {
              totalSleepMinutes += currentSleepMinutes
            }
          }
          // Don't increment sleep cycles since this one is not complete
        }
        // Calculate sleep quality
        const quality = calculateSleepQuality(sleepCycles, totalSleepMinutes)
        // Calculate percentage of recommended sleep (assuming 16 hours for infants)
        const recommendedSleepMinutes = 16 * 60 // 16 hours in minutes
        const percentage = Math.min(Math.round((totalSleepMinutes / recommendedSleepMinutes) * 100), 100)
        // Add to sleep stats
        sleepStats.push({
          name: child.firstName,
          totalSleep: formatSleepDuration(totalSleepMinutes),
          percentage,
          textColor: colorTheme === 'primary' ? 'text-primary' : 'text-secondary',
          progressClass: colorTheme === 'primary' ? 'progress-primary' : 'progress-secondary',
          quality
        })
      }
      sleepData.value = sleepStats
    } catch (err) {
      console.error('Error fetching sleep data:', err)
      error.value = 'Failed to load sleep data'
    } finally {
      loading.value = false
    }
  }
}
// Use mock data when API fails
const useMockData = () => {
  sleepData.value = [
    {
      name: 'Anna',
      totalSleep: '14h 30m',
      percentage: 87,
      textColor: 'text-primary',
      progressClass: 'progress-primary',
      quality: SleepQuality.GOOD
    },
    {
      name: 'Ben',
      totalSleep: '15h 45m',
      percentage: 94,
      textColor: 'text-secondary',
      progressClass: 'progress-secondary',
      quality: SleepQuality.POOR
    }
  ]
}
onMounted(async () => {
  await fetchSleepData()
})
</script>
