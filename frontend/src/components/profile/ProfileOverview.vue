<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body items-center text-center">
			<!-- Avatar Section -->
			<div class="avatar avatar-online">
				<div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
					<img :src="displayAvatar" :alt="displayName" />
				</div>
			</div>
			<!-- Loading indicator -->
			<div v-if="loading" class="mt-4">
				<span class="loading loading-spinner loading-md text-primary"></span>
			</div>
			<!-- Error message -->
			<div v-if="error" class="mt-4 text-error text-sm">
				{{ error }}
			</div>
			<button
				class="btn btn-outline btn-sm mt-4"
				@click="openAvatarModal"
			>
				<i class="fa-solid fa-camera"></i>
				Change Photo
			</button>
			<!-- User Info -->
			<div class="mt-6 w-full">
				<h2 class="text-2xl font-bold">{{ displayName }}</h2>
				<p class="text-base-content/70">{{ authStore.user?.email }}</p>
			</div>
		</div>
		<!-- Avatar Upload Modal -->
		<dialog ref="avatarModal" class="modal">
			<div class="modal-box">
				<h3 class="font-bold text-lg mb-4">Update Profile Photo</h3>
				<div class="space-y-4">
					<!-- Current Avatar Preview -->
					<div class="text-center">
						<div class="avatar">
							<div class="w-24 h-24 rounded-full">
								<img :src="previewAvatar || displayAvatar" alt="Preview" />
							</div>
						</div>
					</div>
					<!-- Upload Options -->
					<div class="space-y-3">
						<div class="form-control">
							<label class="label">
								<span class="label-text">Upload New Photo</span>
							</label>
							<input
								type="file"
								class="file-input file-input-bordered w-full"
								accept="image/*"
								@change="handleFileUpload"
							/>
							<label class="label">
								<span class="label-text-alt">Max size: 5MB. Formats: JPG, PNG, GIF</span>
							</label>
						</div>
					</div>
				</div>
				<div class="modal-action">
					<button
						class="btn btn-ghost"
						@click="closeAvatarModal"
						:disabled="isUploading"
					>
						Cancel
					</button>
					<button
						class="btn btn-primary"
						:class="{ 'loading': isUploading }"
						:disabled="!previewAvatar || isUploading"
						@click="saveAvatar"
					>
						{{ isUploading ? 'Saving...' : 'Save Photo' }}
					</button>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button @click="closeAvatarModal">close</button>
			</form>
		</dialog>
	</div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import AuthService from '@/services/auth.service'
import MediaService from '@/services/media.service'
import { useAuthStore } from '@/stores/auth.store'
const emit = defineEmits(['avatar-updated'])
// Store
const authStore = useAuthStore()
// Refs
const avatarModal = ref(null)
const isUploading = ref(false)
const previewAvatar = ref(null)
const selectedFile = ref(null)
const loading = ref(false)
const error = ref(null)
// Computed properties
const displayName = computed(() => {
	if (authStore.user?.firstName && authStore.user?.lastName) {
		return `${authStore.user.firstName} ${authStore.user.lastName}`
	}
	return authStore.user?.name || 'User'
})
const displayAvatar = computed(() => {
	if (authStore.user?.avatarUrl) {
		return MediaService.getAvatarUrl(authStore.user.avatarUrl)
	}
	// Generate initials avatar if no avatar is set
	return MediaService.getInitialsAvatar(displayName.value)
})
// Fetch user profile
const fetchUserProfile = async () => {
	loading.value = true
	error.value = null
	try {
		await authStore.fetchUserProfile()
	} catch (err) {
		console.error('Error fetching user profile:', err)
		error.value = 'Failed to load profile'
	} finally {
		loading.value = false
	}
}
// Methods
const openAvatarModal = () => {
	previewAvatar.value = displayAvatar.value
	avatarModal.value?.showModal()
}
const closeAvatarModal = () => {
	avatarModal.value?.close()
	previewAvatar.value = null
	selectedFile.value = null
}
const handleFileUpload = (event) => {
	const file = event.target.files[0]
	if (!file) return
	// Validate file size (5MB)
	if (file.size > 5 * 1024 * 1024) {
		alert('File size must be less than 5MB')
		return
	}
	// Validate file type
	if (!file.type.startsWith('image/')) {
		alert('Please select an image file')
		return
	}
	// Store the file for upload
	selectedFile.value = file
	// Create preview URL
	const reader = new FileReader()
	reader.onload = (e) => {
		previewAvatar.value = e.target.result
	}
	reader.readAsDataURL(file)
}
const saveAvatar = async () => {
	if (!previewAvatar.value) return
	isUploading.value = true
	try {
		let updatedProfile
		if (selectedFile.value) {
			// Upload the actual file
			updatedProfile = await AuthService.uploadAvatar(selectedFile.value)
		} else if (previewAvatar.value.startsWith('https://ui-avatars.com')) {
			// Save the UI Avatars URL
			updatedProfile = await AuthService.updateProfile({ avatarUrl: previewAvatar.value })
		} else {
			// For other URLs, just update the profile
			updatedProfile = await AuthService.updateProfile({ avatarUrl: previewAvatar.value })
		}
		// Update auth store directly
		if (updatedProfile && authStore.user) {
			authStore.user.avatarUrl = updatedProfile.avatarUrl || ''
		}
		// Emit update event
		emit('avatar-updated', {
			avatar: authStore.user?.avatarUrl,
			timestamp: new Date()
		})
		closeAvatarModal()
	} catch (error) {
		console.error('Error uploading avatar:', error)
		alert('Failed to upload avatar. Please try again.')
	} finally {
		isUploading.value = false
	}
}
// Initialize component
onMounted(async () => {
	await fetchUserProfile()
})
</script>