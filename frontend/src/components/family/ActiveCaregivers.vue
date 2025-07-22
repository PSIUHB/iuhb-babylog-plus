<template>
	<div class="mt-8">
		<h4 class="font-semibold text-sm text-base-content/70 mb-3">Active Caregivers</h4>
		<div v-if="loading" class="flex justify-center p-4">
			<span class="loading loading-spinner loading-sm"></span>
		</div>
		<div v-else-if="error" class="text-sm text-error p-2">
			{{ error }}
		</div>
		<div v-else-if="caregivers.length === 0" class="text-sm text-base-content/60 p-2">
			No active caregivers found
		</div>
		<div v-else class="space-y-2">
			<div
				v-for="caregiver in caregivers"
				:key="caregiver.id"
				class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer"
			>
				<div
					class="avatar"
					:class="isOnline(caregiver) ? 'avatar-online' : 'avatar-offline'"
				>
					<div class="w-8 h-8 rounded-full">
						<img 
							:src="caregiver.avatar || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'" 
							:alt="getCaregiversName(caregiver)" 
						/>
					</div>
				</div>
				<div>
					<div class="text-sm font-semibold">
						{{ getCaregiversName(caregiver) }}{{ isCurrentUser(caregiver) ? ' (You)' : '' }}
					</div>
					<div class="text-xs text-base-content/60">{{ getLastActiveText(caregiver) }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useFamilyStore } from '@/stores/family.store'
import caregiversService, { Caregiver } from '@/services/caregivers.service'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const caregivers = ref<Caregiver[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

const currentUser = computed(() => authStore.getUser)
const currentFamilyId = computed(() => familyStore.getCurrentFamilyId)

// Fetch caregivers when component is mounted
onMounted(async () => {
  await fetchCaregivers()
})

// Watch for changes in the current family ID
watch(currentFamilyId, async (newFamilyId) => {
  if (newFamilyId) {
    await fetchCaregivers()
  }
})

// Fetch caregivers from the service
const fetchCaregivers = async (): Promise<void> => {
  if (!currentFamilyId.value) return

  loading.value = true
  error.value = null

  try {
    const data = await caregiversService.getCaregiversByFamily(currentFamilyId.value)
    
    // Check if the response is an error object
    if (data && data.error === true) {
      console.error('Error fetching caregivers:', data.message)
      error.value = 'Failed to load caregivers'
      caregivers.value = []
    } else {
      caregivers.value = data || []
    }
  } catch (err) {
    console.error('Error fetching caregivers:', err)
    error.value = 'Failed to load caregivers'
    caregivers.value = []
  } finally {
    loading.value = false
  }
}

// Check if caregiver is the current user
const isCurrentUser = (caregiver: Caregiver): boolean => {
	return caregiver.id === currentUser.value?.id
}

// Check if caregiver is online (simplified logic)
const isOnline = (caregiver: Caregiver): boolean => {
	return caregiver.status === 'active'
}

// Get caregiver's name
const getCaregiversName = (caregiver: Caregiver): string => {
	return `${caregiver.firstName} ${caregiver.lastName}`.trim()
}

// Get formatted last active text
const getLastActiveText = (caregiver: Caregiver): string => {
	if (isOnline(caregiver)) {
		return 'Active now'
	}

	if (caregiver.lastActive) {
		// Simple formatting - in a real app, you'd use a date library
		const lastActive = new Date(caregiver.lastActive)
		const now = new Date()
		const diffMs = now.getTime() - lastActive.getTime()
		const diffMins = Math.floor(diffMs / 60000)

		if (diffMins < 60) {
			return `${diffMins} min ago`
		} else {
			const diffHours = Math.floor(diffMins / 60)
			return `${diffHours} hours ago`
		}
	}

	return 'Unknown'
}
</script>