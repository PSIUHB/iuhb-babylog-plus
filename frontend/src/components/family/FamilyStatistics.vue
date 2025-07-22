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
	<div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Family Overview Stats -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h3 class="card-title mb-4">Family Overview</h3>
				<div class="stats stats-vertical shadow-none bg-transparent">
					<div class="stat px-0">
						<div class="stat-figure text-primary">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<div class="stat-title">Total Caregivers</div>
						<div class="stat-value text-primary">{{ statistics.totalCaregivers }}</div>
						<div class="stat-desc">{{ statistics.activeCaregivers }} currently active</div>
					</div>

					<div class="stat px-0">
						<div class="stat-figure text-secondary">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
							</svg>
						</div>
						<div class="stat-title">Children</div>
						<div class="stat-value text-secondary">{{ statistics.totalChildren }}</div>
						<div class="stat-desc">Twins born {{ statistics.childrenAge }}</div>
					</div>

					<div class="stat px-0">
						<div class="stat-figure text-accent">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="stat-title">Days Since Birth</div>
						<div class="stat-value text-accent">{{ statistics.daysSinceBirth }}</div>
						<div class="stat-desc">{{ statistics.totalEvents }} total events logged</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Activity Breakdown -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h3 class="card-title mb-4">Family Activity</h3>
				<div class="space-y-4">
					<!-- Most Active Caregiver -->
					<div class="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
						<div class="flex items-center gap-3">
							<div class="avatar">
								<div class="w-10 h-10 rounded-full">
									<img :src="statistics.mostActiveCaregiver.avatar" :alt="statistics.mostActiveCaregiver.name" />
								</div>
							</div>
							<div>
								<div class="font-semibold text-sm">Most Active Caregiver</div>
								<div class="text-xs text-base-content/70">{{ statistics.mostActiveCaregiver.name }}</div>
							</div>
						</div>
						<div class="text-right">
							<div class="text-lg font-bold text-primary">{{ statistics.mostActiveCaregiver.eventsToday }}</div>
							<div class="text-xs text-base-content/60">events today</div>
						</div>
					</div>

					<!-- Weekly Summary -->
					<div class="space-y-2">
						<div class="text-sm font-semibold text-base-content/70">This Week's Summary</div>
						<div class="grid grid-cols-2 gap-3">
							<div class="text-center p-3 bg-base-200 rounded-lg">
								<div class="text-lg font-bold text-secondary">{{ statistics.weeklyStats.feedings }}</div>
								<div class="text-xs text-base-content/60">Feedings</div>
							</div>
							<div class="text-center p-3 bg-base-200 rounded-lg">
								<div class="text-lg font-bold text-accent">{{ statistics.weeklyStats.sleepHours }}h</div>
								<div class="text-xs text-base-content/60">Sleep</div>
							</div>
							<div class="text-center p-3 bg-base-200 rounded-lg">
								<div class="text-lg font-bold text-warning">{{ statistics.weeklyStats.diaperChanges }}</div>
								<div class="text-xs text-base-content/60">Diapers</div>
							</div>
							<div class="text-center p-3 bg-base-200 rounded-lg">
								<div class="text-lg font-bold text-info">{{ statistics.weeklyStats.milestones }}</div>
								<div class="text-xs text-base-content/60">Milestones</div>
							</div>
						</div>
					</div>

					<!-- Family Milestones -->
					<div class="space-y-2">
						<div class="text-sm font-semibold text-base-content/70">Recent Milestones</div>
						<div class="space-y-2">
							<div
								v-for="milestone in statistics.recentMilestones"
								:key="milestone.id"
								class="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg"
							>
								<div class="text-lg">{{ milestone.icon }}</div>
								<div class="flex-1">
									<div class="text-sm font-medium">{{ milestone.title }}</div>
									<div class="text-xs text-base-content/60">{{ milestone.child }} • {{ milestone.date }}</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Quick Actions -->
					<div class="pt-2 border-t border-base-300">
						<div class="flex gap-2">
							<button class="btn btn-outline btn-sm flex-1">
								📊 View Full Reports
							</button>
							<button class="btn btn-primary btn-sm flex-1">
								📤 Export Data
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import StatisticsService from '@/services/statistics.service'

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
