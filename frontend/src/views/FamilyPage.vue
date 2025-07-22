<template>
	<div class="min-h-screen bg-base-100" data-theme="baby-light">
		<AppLayout>
			<div v-if="loading" class="flex-1 p-6 flex items-center justify-center">
				<div class="loading loading-spinner loading-lg text-primary"></div>
			</div>
			<div v-else-if="error" class="flex-1 p-6">
				<div class="alert alert-error">
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					<span>{{ error }}</span>
				</div>
			</div>
			<div v-else class="flex-1 p-6">
				<!-- Page Header -->
				<div class="mb-8">
					<h2 class="text-2xl font-bold text-base-content mb-2">Family Management</h2>
					<p class="text-base-content/70">Manage your family settings, children, and caregivers</p>
				</div>

				<!-- Tabs Navigation -->
				<div role="tablist" class="tabs tabs-box tabs-lg mb-6">
					<a role="tab"
					   class="tab"
					   :class="{ 'tab-active': activeTab === 'settings' }"
					   @click="activeTab = 'settings'"
					>
						Family Settings
					</a>
					<a role="tab"
					   class="tab"
					   :class="{ 'tab-active': activeTab === 'children' }"
					   @click="activeTab = 'children'"
					>
						Children Management
					</a>
					<a role="tab"
					   class="tab"
					   :class="{ 'tab-active': activeTab === 'caregivers' }"
					   @click="activeTab = 'caregivers'"
					>
						Caregivers Management
					</a>
					<a role="tab"
					   class="tab"
					   :class="{ 'tab-active': activeTab === 'milestones' }"
					   @click="activeTab = 'milestones'"
					>
						Milestones
					</a>
				</div>

				<!-- Tab Content -->
				<div class="mb-8">
					<!-- Family Settings Tab -->
					<div v-if="activeTab === 'settings'">
						<FamilySettings 
							:family="family" 
							@family-updated="handleFamilyUpdate" 
						/>
					</div>

					<!-- Children Management Tab -->
					<div v-if="activeTab === 'children'">
						<ChildrenManagement
							:family-id="family.id"
							@child-added="handleChildAdded"
							@child-updated="handleChildUpdated"
							@child-deleted="handleChildDeleted"
						/>
					</div>

					<!-- Caregivers Management Tab -->
					<div v-if="activeTab === 'caregivers'">
						<CaregiversManagement
							:family-id="family.id"
							@caregiver-invited="handleCaregiverInvited"
							@caregiver-updated="handleCaregiverUpdated"
							@caregiver-removed="handleCaregiverRemoved"
						/>
					</div>

					<!-- Milestones Tab -->
					<div v-if="activeTab === 'milestones'">
						<div v-if="selectedChild">
							<MilestoneTracker :child-id="selectedChild.id" :child="selectedChild" />
						</div>
						<div v-else class="text-center py-8">
							<div class="text-base-content/50 mb-4">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p>Please select a child to view milestones</p>
							</div>
							<div class="flex flex-wrap gap-2 justify-center">
								<button
									v-for="child in children"
									:key="child.id"
									class="btn btn-outline"
									:class="{ 'btn-primary': selectedChild && selectedChild.id === child.id }"
									@click="selectChild(child)"
								>
									{{ child.firstName }} {{ child.lastName }}
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Family Statistics -->
				<div class="mb-8">
					<FamilyStatistics :family-id="family.id" />
				</div>
			</div>
		</AppLayout>
	</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import FamilySettings from '@/components/family/FamilySettings.vue'
import ChildrenManagement from '@/components/family/ChildrenManagement.vue'
import CaregiversManagement from '@/components/family/CaregiversManagement.vue'
import FamilyStatistics from '@/components/family/FamilyStatistics.vue'
import MilestoneTracker from '@/components/milestones/MilestoneTracker.vue'
import FamiliesService from '@/services/families.service'
import ChildrenService from '@/services/children.service'
import CaregiversService from '@/services/caregivers.service'

const route = useRoute()
const family = ref({})
const loading = ref(true)
const error = ref(null)
const activeTab = ref('settings') // Default active tab
const children = ref([])
const selectedChild = ref(null)

// Fetch family data on component mount
onMounted(async () => {
	try {
		// Get the family ID from the route or use the first family
		const familyId = route.params.id

		if (familyId) {
			// Get specific family
			const response = await FamiliesService.getFamily(familyId)
			family.value = response
		} else {
			// Get all families and use the first one
			const response = await FamiliesService.getFamilies()
			if (response && response.length > 0) {
				family.value = response[0]
			} else {
				error.value = 'No families found. Please create a family first.'
			}
		}
	} catch (err) {
		console.error('Error fetching family:', err)
		error.value = 'Failed to load family data. Please try again later.'
	} finally {
		loading.value = false
	}
})

// Event handlers for family operations
const handleFamilyUpdate = async (familyData) => {
	try {
		const response = await FamiliesService.updateFamily(family.value.id, familyData)
		family.value = { ...family.value, ...response }
	} catch (err) {
		console.error('Error updating family:', err)
	}
}

const handleChildAdded = async (childData) => {
	try {
		await ChildrenService.createChild(family.value.id, childData)
		// Refresh children list if needed
	} catch (err) {
		console.error('Error adding child:', err)
	}
}

const handleChildUpdated = async (childData) => {
	try {
		await ChildrenService.updateChild(childData.id, childData)
		// Refresh children list if needed
	} catch (err) {
		console.error('Error updating child:', err)
	}
}

const handleChildDeleted = async (childId) => {
	try {
		await ChildrenService.deleteChild(childId)
		// Refresh children list if needed
	} catch (err) {
		console.error('Error deleting child:', err)
	}
}

const handleCaregiverInvited = async (caregiverData) => {
	try {
		await CaregiversService.inviteCaregiver(family.value.id, caregiverData)
		// Refresh caregivers list if needed
	} catch (err) {
		console.error('Error inviting caregiver:', err)
	}
}

const handleCaregiverUpdated = async (caregiverData) => {
	try {
		await CaregiversService.updateCaregiver(family.value.id, caregiverData.id, caregiverData)
		// Refresh caregivers list if needed
	} catch (err) {
		console.error('Error updating caregiver:', err)
	}
}

const handleCaregiverRemoved = async (caregiverId) => {
	try {
		await CaregiversService.removeCaregiver(family.value.id, caregiverId)
		// Refresh caregivers list if needed
	} catch (err) {
		console.error('Error removing caregiver:', err)
	}
}

// Fetch children for the current family
const fetchChildren = async () => {
	if (!family.value.id) return
	
	try {
		const response = await ChildrenService.getChildrenByFamily(family.value.id)
		children.value = response || []
		
		// If we have children and none is selected, select the first one
		if (children.value.length > 0 && !selectedChild.value) {
			selectedChild.value = children.value[0]
		}
	} catch (err) {
		console.error('Error fetching children:', err)
	}
}

// Select a child for milestone viewing
const selectChild = (child) => {
	selectedChild.value = child
}

// Watch for family changes to fetch children
watch(() => family.value.id, (newFamilyId) => {
	if (newFamilyId) {
		fetchChildren()
	}
}, { immediate: true })

// Watch for tab changes to fetch children when milestones tab is selected
watch(() => activeTab.value, (newTab) => {
	if (newTab === 'milestones') {
		fetchChildren()
	}
})
</script>
