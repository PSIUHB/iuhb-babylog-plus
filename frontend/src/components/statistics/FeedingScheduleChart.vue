<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
   <div class="flex justify-between items-center mb-4">
   				<h3 class="card-title">Today's Feeding Schedule</h3>
				<HelpButton @open-help-modal="openHelpModal" />
   			</div>
			<div v-if="loading" class="flex justify-center items-center py-4">
				<span class="loading loading-spinner loading-md"></span>
			</div>
			<div v-else-if="error" class="alert alert-error">
				{{ error }}
			</div>
			<div v-else>
				<div class="space-y-3">
					<div
						v-for="baby in feedingData"
						:key="baby.id"
						class="flex items-center justify-between p-3 rounded-lg"
						:class="baby.bgClass"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-6 h-6 rounded-full"
								:class="baby.colorClass"
							></div>
							<span class="text-sm font-semibold">{{ baby.name }}</span>
						</div>
						<div class="text-sm">{{ baby.feedings }} feedings</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Help Modal -->
	<HelpModal ref="helpModal" title="Understanding Feeding Schedule">
		<div>
			<h4 class="font-semibold mb-2">About the Chart</h4>
			<p>This chart shows today's feeding schedule for each child. It displays the total number of feedings recorded for each child since midnight.</p>
		</div>
		
		<div>
			<h4 class="font-semibold mb-2">Feeding Count</h4>
			<p>The number displayed represents how many times each child has been fed today. This helps you track feeding frequency and ensure regular nutrition.</p>
		</div>
		
		<div>
			<h4 class="font-semibold mb-2">Color Coding</h4>
			<p>Each child is assigned a unique color to help you quickly identify their feeding information at a glance.</p>
		</div>
	</HelpModal>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import childrenService from '@/services/children.service'
import { useFamilyStore } from '@/stores/family.store'
import feedsService from '@/services/feeds.service'
import { TrackableType } from '@/enums/trackable-type.enum'
import HelpModal from '@/components/global/HelpModal.vue'
import HelpButton from '@/components/global/HelpButton.vue'

const feedingData = ref([])
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

// Format time until next feeding
const formatTimeUntilNextFeeding = (lastFeedingTime) => {
  const now = new Date()
  const lastFeeding = new Date(lastFeedingTime)
  const timeSinceLastFeeding = now - lastFeeding

  // Assuming babies should be fed every 3 hours
  const feedingInterval = 3 * 60 * 60 * 1000 // 3 hours in milliseconds
  const timeUntilNextFeeding = feedingInterval - timeSinceLastFeeding

  if (timeUntilNextFeeding <= 0) {
    return 'Now'
  }

  const minutesUntil = Math.floor(timeUntilNextFeeding / (60 * 1000))
  const hoursUntil = Math.floor(minutesUntil / 60)
  const remainingMinutes = minutesUntil % 60

  if (hoursUntil > 0) {
    return `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''} ${remainingMinutes > 0 ? remainingMinutes + ' minutes' : ''}`
  } else {
    return `${minutesUntil} minutes`
  }
}

// Get child color theme
const getChildColorTheme = (childId) => {
  return parseInt(childId) % 2 === 0 ? 'secondary' : 'primary'
}

// Fetch feeding data
const fetchFeedingData = async () => {
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

      // Calculate today's feedings for each child
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const feedingStats = []

      for (const child of childrenResponse) {
        const colorTheme = getChildColorTheme(child.id)

        // Fetch feeds for the child
        const feeds = await feedsService.findAll(child.id)
        
        // Sort feeds by occurredAt in descending order
        const sortedFeeds = feeds && feeds.length > 0 
          ? [...feeds].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
          : []
          
        // Count today's feedings
        const todayFeedings = sortedFeeds.filter(feed => new Date(feed.occurredAt) >= today).length

        // Add to feeding stats
        feedingStats.push({
          name: child.firstName,
          feedings: todayFeedings,
          bgClass: colorTheme === 'primary' ? 'bg-primary/5' : 'bg-secondary/5',
          colorClass: colorTheme === 'primary' ? 'bg-primary' : 'bg-secondary'
        })
      }

      feedingData.value = feedingStats
    } catch (err) {
      console.error('Error fetching feeding data:', err)
      error.value = 'Failed to load feeding data'
    } finally {
      loading.value = false
    }
  }
}

onMounted(async () => {
  await fetchFeedingData()
})
</script>
