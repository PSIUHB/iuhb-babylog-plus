<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body items-center text-center">
			<!-- Avatar Section -->
			<div class="avatar avatar-online">
				<div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
					<img :src="userProfile.avatar" :alt="userProfile.name" />
				</div>
			</div>

			<button
				class="btn btn-outline btn-sm mt-4"
				@click="openAvatarModal"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
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
								<img :src="previewAvatar || userProfile.avatar" alt="Preview" />
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
import { ref, reactive } from 'vue'

const emit = defineEmits(['avatar-updated'])

// Refs
const avatarModal = ref(null)
const isUploading = ref(false)
const previewAvatar = ref(null)

// User profile data
const userProfile = reactive({
	name: 'Sarah Johnson',
	email: 'sarah.johnson@example.com',
	role: 'Family Owner',
	avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
	memberSince: '2024-01-15',
	eventsLogged: 1247,
	familyMembers: 4
})

// Avatar options
const avatarOptions = ref([
	{ id: 1, url: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp' },
	{ id: 2, url: 'https://img.daisyui.com/images/stock/photo-1494790108755-2616c27b1c4c.webp' },
	{ id: 3, url: 'https://img.daisyui.com/images/stock/photo-1531927557220-a9e23c1e4794.webp' },
	{ id: 4, url: 'https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.webp' },
	{ id: 5, url: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=ff6b9d&color=fff' },
	{ id: 6, url: 'https://ui-avatars.com/api/?name=SJ&background=74b9ff&color=fff' },
	{ id: 7, url: 'https://ui-avatars.com/api/?name=Sarah&background=55efc4&color=fff' },
	{ id: 8, url: 'https://ui-avatars.com/api/?name=Mom&background=fdcb6e&color=fff' }
])

// Methods
const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long'
	})
}

const openAvatarModal = () => {
	previewAvatar.value = userProfile.avatar
	avatarModal.value?.showModal()
}

const closeAvatarModal = () => {
	avatarModal.value?.close()
	previewAvatar.value = null
}

const selectAvatar = (avatarUrl) => {
	previewAvatar.value = avatarUrl
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
		// Simulate upload delay
		await new Promise(resolve => setTimeout(resolve, 1500))

		// Update user profile
		userProfile.avatar = previewAvatar.value

		// Emit update event
		emit('avatar-updated', {
			avatar: previewAvatar.value,
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
</script>