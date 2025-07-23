<template>
	<!-- Loading State -->
	<div v-if="loading" class="flex justify-center py-8">
		<div class="loading loading-spinner loading-lg text-primary"></div>
	</div>

	<!-- Error State -->
	<div v-else-if="error" class="alert alert-error">
		<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
		<span>{{ error }}</span>
	</div>

	<!-- Statistics Content -->
	<div v-else class="stats stats-vertical lg:stats-horizontal bg-base-100 shadow-lg mb-6 w-full">
		<div class="stat">
			<div class="stat-figure text-primary">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
				</svg>
			</div>
			<div class="stat-title">Total Children</div>
			<div class="stat-value text-primary">{{ statistics.totalChildren }}</div>
			<div class="stat-desc">{{ statistics.childrenAge }}</div>
		</div>
		
		<div class="stat">
			<div class="stat-figure text-secondary">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<div class="stat-title">Days Since Birth</div>
			<div class="stat-value text-secondary">{{ statistics.daysSinceBirth }}</div>
			<div class="stat-desc">{{ statistics.totalEvents }} total events logged</div>
		</div>
		
		<div class="stat">
			<div class="stat-figure text-accent">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
			</div>
			<div class="stat-title">Total Caregivers</div>
			<div class="stat-value text-accent">{{ statistics.totalCaregivers }}</div>
			<div class="stat-desc">{{ statistics.activeCaregivers }} currently active</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import StatisticsService from '@/services/statistics.service'
import MediaService from '@/services/media.service'

const props = defineProps({
	familyId: {
		type: String,
		required: true
	}
})

// Reactive data
const statistics = ref({
	totalCaregivers: 0,
	activeCaregivers: 0,
	totalChildren: 0,
	childrenAge: '',
	daysSinceBirth: 0,
	totalEvents: 0,
	mostActiveCaregiver: {
		name: '',
		avatar: '',
		eventsToday: 0
	},
	weeklyStats: {
		feedings: 0,
		sleepHours: 0,
		diaperChanges: 0,
		milestones: 0
	},
	recentMilestones: []
})
const loading = ref(false)
const error = ref(null)

// Fetch statistics from API
const fetchStatistics = async () => {
	if (!props.familyId) return

	loading.value = true
	error.value = null

	try {
		const response = await StatisticsService.getFamilyStatistics(props.familyId)
		
		// Check if the response is an error object
		if (response && response.error === true) {
			console.error('Error fetching statistics:', response.message)
			error.value = 'Failed to load statistics. Please try again.'
		} else {
			statistics.value = response
		}
	} catch (err) {
		console.error('Error fetching statistics:', err)
		error.value = 'Failed to load statistics. Please try again.'
	} finally {
		loading.value = false
	}
}

// Fetch statistics when familyId changes
watch(() => props.familyId, (newFamilyId) => {
	if (newFamilyId) {
		fetchStatistics()
	}
}, { immediate: true })

// Computed properties for dynamic updates
const familyActivityLevel = computed(() => {
	const eventsPerDay = statistics.value.totalEvents / statistics.value.daysSinceBirth
	if (eventsPerDay > 15) return { level: 'Very Active', color: 'text-success' }
	if (eventsPerDay > 10) return { level: 'Active', color: 'text-primary' }
	if (eventsPerDay > 5) return { level: 'Moderate', color: 'text-warning' }
	return { level: 'Light', color: 'text-base-content' }
})
</script>
