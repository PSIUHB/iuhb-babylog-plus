<template>
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-base-content mb-2">Welcome back, {{ userName }}! 👋</h2>
		<div v-if="loading" class="text-base-content/70">
			<span class="loading loading-spinner loading-sm"></span> Loading family data...
		</div>
		<div v-else-if="error" class="text-error text-sm">
			{{ error }}
		</div>
		<p v-else-if="babyNames.length > 0" class="text-base-content/70">
			Here's what's happening with {{ joinBabyNames }} today.
		</p>
		<p v-else class="text-base-content/70">
			Add children to your family to see their data here.
		</p>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useFamilyStore } from '@/stores/family.store'
import childrenService from '@/services/children.service'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const loading = ref(false)
const error = ref(null)
const babyNames = ref([])

// Get user's first name from auth store
const userName = computed(() => {
	const user = authStore.getUser
	return user ? user.firstName : 'User'
})

// Get current family ID from family store
const currentFamilyId = computed(() => familyStore.getCurrentFamilyId)

const joinBabyNames = computed(() => {
	const names = babyNames.value;
	if (names.length === 0) return '';
	if (names.length === 1) return names[0];
	return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
});

// Fetch children data
const fetchChildrenData = async () => {
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

			// Extract children names
			babyNames.value = childrenResponse.map(child => child.firstName)
		} catch (err) {
			console.error('Error fetching children data:', err)
			error.value = 'Failed to load children data'
		} finally {
			loading.value = false
		}
	}
}

onMounted(async () => {
	await fetchChildrenData()
})
</script>