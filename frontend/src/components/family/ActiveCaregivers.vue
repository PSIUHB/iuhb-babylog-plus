<template>
	<div class="bg-base-100 rounded-lg p-4 shadow-sm border border-base-200">
		<h4 class="font-semibold text-sm text-base-content/70 mb-3">Active Caregivers</h4>

		<div v-if="loading" class="flex justify-center py-4">
			<span class="loading loading-spinner loading-sm"></span>
		</div>

		<div v-else-if="activeCaregivers.length === 0" class="text-center py-4 text-base-content/50">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
			</svg>
			<p class="text-sm">No caregivers currently online</p>
		</div>

		<div v-else class="space-y-3">
			<div v-for="caregiver in activeCaregivers" :key="caregiver.id" class="flex items-center space-x-3">
				<div class="relative">
					<div class="avatar">
						<div class="w-10 h-10 rounded-full">
							<img :src="caregiver.avatarUrl ? MediaService.getAvatarUrl(caregiver.avatarUrl) : MediaService.getInitialsAvatar(caregiver.name)" :alt="caregiver.name" />
						</div>
					</div>
					<!-- Online indicator -->
					<div class="absolute -bottom-0 -right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
				</div>

				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-base-content truncate">
						{{ caregiver.name }}
					</p>
					<p class="text-xs text-base-content/60 capitalize">
						{{ caregiver.role }}
					</p>
				</div>

				<div class="text-xs text-success font-medium">
					Online
				</div>
			</div>
		</div>

		<!-- Show offline members if there are any -->
		<div v-if="offlineCaregivers.length > 0" class="mt-4 pt-3 border-t border-base-200">
			<p class="text-xs text-base-content/50 mb-2">Offline ({{ offlineCaregivers.length }})</p>
			<div class="space-y-2">
				<div v-for="caregiver in offlineCaregivers.slice(0, 3)" :key="caregiver.id" class="flex items-center space-x-3 opacity-60">
					<div class="avatar">
						<div class="w-8 h-8 rounded-full">
							<img :src="caregiver.avatarUrl ? MediaService.getAvatarUrl(caregiver.avatarUrl) : MediaService.getInitialsAvatar(caregiver.name)" :alt="caregiver.name" />
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-xs text-base-content/70 truncate">
							{{ caregiver.name }}
						</p>
					</div>
					<div class="text-xs text-base-content/40">
						Offline
					</div>
				</div>
				<div v-if="offlineCaregivers.length > 3" class="text-xs text-base-content/40 text-center">
					+{{ offlineCaregivers.length - 3 }} more offline
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family.store'
import MediaService from '@/services/media.service'

const familyStore = useFamilyStore()

// Computed properties
const loading = computed(() => familyStore.loading)
const currentFamily = computed(() => familyStore.currentFamily)
const connectedCaregivers = computed(() => familyStore.connectedCaregivers || [])

// Get all family members and their online status
const activeCaregivers = computed(() => {
	if (!currentFamily.value?.userFamilies) return []

	return currentFamily.value.userFamilies
		.filter(uf => !uf.leftAt) // Only active members
		.filter(uf => connectedCaregivers.value.includes(uf.userId)) // Only connected users
		.map(uf => ({
			id: uf.userId,
			name: `${uf.user.firstName} ${uf.user.lastName}`,
			role: uf.role,
			avatarUrl: uf.user.avatarUrl,
			isOnline: true
		}))
})

const offlineCaregivers = computed(() => {
	if (!currentFamily.value?.userFamilies) return []

	return currentFamily.value.userFamilies
		.filter(uf => !uf.leftAt) // Only active members
		.filter(uf => !connectedCaregivers.value.includes(uf.userId)) // Only disconnected users
		.map(uf => ({
			id: uf.userId,
			name: `${uf.user.firstName} ${uf.user.lastName}`,
			role: uf.role,
			avatarUrl: uf.user.avatarUrl,
			isOnline: false
		}))
})

onMounted(() => {
	// Ensure WebSocket connection is established
	familyStore.setupWebSocketConnection()
})
</script>
