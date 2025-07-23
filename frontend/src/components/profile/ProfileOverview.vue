<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body items-center text-center">
			<!-- Avatar Section -->
			<div class="avatar avatar-online">
				<div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
					<img :src="displayAvatar" :alt="userProfile.name" />
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
				<h2 class="text-2xl font-bold">{{ userProfile.name }}</h2>
				<p class="text-base-content/70">{{ userProfile.email }}</p>
				<div class="badge badge-primary mt-2">{{ userProfile.role }}</div>
			</div>

			<!-- Quick Stats -->
			<div class="stats stats-vertical shadow-none bg-transparent mt-6 w-full">
				<div class="stat px-0 py-2">
					<div class="stat-title text-xs">Member Since</div>
					<div class="stat-value text-sm">{{ formatDate(userProfile.memberSince) }}</div>
				</div>
				<div class="stat px-0 py-2">
					<div class="stat-title text-xs">Events Logged</div>
					<div class="stat-value text-sm text-primary">{{ userProfile.eventsLogged }}</div>
				</div>
				<div class="stat px-0 py-2">
					<div class="stat-title text-xs">Family Members</div>
					<div class="stat-value text-sm text-secondary">{{ userProfile.familyMembers }}</div>
				</div>
			</div>

			<!-- Account Status -->
			<div class="w-full mt-4">
				<div class="flex items-center justify-between p-3 bg-success/10 rounded-lg">
					<div class="flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="text-sm font-medium">Account Verified</span>
					</div>
				</div>
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

						<div class="divider">OR</div>

						<!-- Avatar Options -->
						<div class="form-control">
							<label class="label">
								<span class="label-text">Choose Avatar</span>
							</label>
							<div class="grid grid-cols-4 gap-2">
								<div
									v-for="avatar in avatarOptions"
									:key="avatar.id"
									class="avatar cursor-pointer hover:scale-110 transition-transform"
									:class="{ 'ring ring-primary': previewAvatar === avatar.url }"
									@click="selectAvatar(avatar.url)"
								>
									<div class="w-12 h-12 rounded-full">
										<img :src="avatar.url" :alt="`Avatar ${avatar.id}`" />
									</div>
								</div>
							</div>
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
import { ref, reactive, onMounted, computed } from 'vue'
import AuthService from '@/services/auth.service'
import MediaService from '@/services/media.service'

const emit = defineEmits(['avatar-updated'])

// Refs
const avatarModal = ref(null)
const isUploading = ref(false)
const previewAvatar = ref(null)
const selectedFile = ref(null)
const loading = ref(true)
const error = ref(null)

// User profile data
const userProfile = reactive({
	name: '',
	email: '',
	role: 'Family Member',
	avatar: '',
	memberSince: '',
	eventsLogged: 0,
	familyMembers: 0
})

// Computed properties
const displayAvatar = computed(() => {
	if (userProfile.avatar) {
		return MediaService.getAvatarUrl(userProfile.avatar)
	}
	// Generate initials avatar if no avatar is set
	return MediaService.getInitialsAvatar(`${userProfile.name}`)
})

// Avatar options with UI Avatars
const avatarOptions = ref([
	{ id: 1, url: 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff' },
	{ id: 2, url: 'https://ui-avatars.com/api/?name=User&background=f43f5e&color=fff' },
	{ id: 3, url: 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff' },
	{ id: 4, url: 'https://ui-avatars.com/api/?name=User&background=f59e0b&color=fff' },
	{ id: 5, url: 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff' },
	{ id: 6, url: 'https://ui-avatars.com/api/?name=User&background=ec4899&color=fff' },
	{ id: 7, url: 'https://ui-avatars.com/api/?name=User&background=14b8a6&color=fff' },
	{ id: 8, url: 'https://ui-avatars.com/api/?name=User&background=f97316&color=fff' }
])

// Fetch user profile
const fetchUserProfile = async () => {
	loading.value = true
	error.value = null
	
	try {
		const profile = await AuthService.getProfile()
		
		// Update user profile data
		userProfile.name = `${profile.firstName} ${profile.lastName}`
		userProfile.email = profile.email
		userProfile.avatar = profile.avatarUrl || ''
		
		// Set member since date from profile id (contains timestamp)
		if (profile.id) {
			const timestamp = parseInt(profile.id.substring(0, 8), 16) * 1000
			userProfile.memberSince = new Date(timestamp).toISOString().split('T')[0]
		} else {
			userProfile.memberSince = new Date().toISOString().split('T')[0]
		}
		
		// Update avatar options with user's name
		avatarOptions.value = avatarOptions.value.map(option => ({
			...option,
			url: option.url.replace('name=User', `name=${encodeURIComponent(userProfile.name)}`)
		}))
	} catch (err) {
		console.error('Error fetching user profile:', err)
		error.value = 'Failed to load profile'
	} finally {
		loading.value = false
	}
}

// Methods
const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long'
	})
}

const openAvatarModal = () => {
	previewAvatar.value = displayAvatar.value
	avatarModal.value?.showModal()
}

const closeAvatarModal = () => {
	avatarModal.value?.close()
	previewAvatar.value = null
	selectedFile.value = null
}

const selectAvatar = (avatarUrl) => {
	previewAvatar.value = avatarUrl
	selectedFile.value = null // Clear any selected file
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

		// Update user profile with the response
		if (updatedProfile) {
			userProfile.avatar = updatedProfile.avatarUrl || ''
		}

		// Emit update event
		emit('avatar-updated', {
			avatar: userProfile.avatar,
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