<template>
	<h3 class="card-title mb-6">Account Settings</h3>
	<!-- Loading indicator -->
	<div v-if="loading" class="flex justify-center my-4">
		<span class="loading loading-spinner loading-md text-primary"></span>
	</div>
	<!-- Account Status -->
	<div class="space-y-4 mb-6">
		<h4 class="text-lg font-semibold">Status</h4>
		<div class="grid grid-cols-1">
			<div class="flex items-center justify-between p-4 bg-success/10 rounded-lg">
				<div class="flex items-center gap-3">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<div class="font-semibold">Email Verified</div>
						<div class="text-sm text-base-content/70">{{ accountSettings.email }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- Subscription Information -->
	<div class="space-y-4 mb-6">
		<h4 class="text-lg font-semibold">Subscription</h4>
		<div class="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
			<div class="card-body">
				<div class="flex justify-between items-start">
					<div>
						<h5 class="font-bold text-lg">{{ accountSettings.subscription.plan }}</h5>
						<p class="text-base-content/70">{{ accountSettings.subscription.description }}</p>
						<div class="flex items-center gap-4 mt-2">
							<span class="text-2xl font-bold text-primary">{{ accountSettings.subscription.price }}</span>
							<div class="badge badge-primary">{{ accountSettings.subscription.status }}</div>
						</div>
					</div>
					<button class="btn btn-primary btn-sm">Manage Plan</button>
				</div>
				<div class="mt-4 text-sm text-base-content/60">
					<p>{{ accountSettings.subscription.features.join(", ") }}</p>
				</div>
			</div>
		</div>
	</div>
	<!-- Delete Account Confirmation Modal -->
	<dialog ref="deleteAccountModal" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg text-error mb-4">Delete Account</h3>
			<div class="space-y-4">
				<div class="alert alert-error">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
					<span>This action is permanent and cannot be undone!</span>
				</div>
				<p class="text-sm">
					Deleting your account will permanently remove:
				</p>
				<ul class="text-sm list-disc list-inside space-y-1 text-base-content/70">
					<li>All your children's data and events</li>
					<li>Family settings and caregiver access</li>
					<li>Reports and analytics</li>
					<li>Account preferences and settings</li>
				</ul>
				<TextInput
					v-model="deleteConfirmation"
					label="Type <strong>DELETE</strong> to confirm:"
					placeholder="DELETE"
				/>
			</div>
			<div class="modal-action">
				<button class="btn btn-ghost" @click="closeDeleteAccountModal">Cancel</button>
				<button
					class="btn btn-error"
					:disabled="deleteConfirmation !== 'DELETE'"
					@click="confirmDeleteAccount"
				>
					Delete Account
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button @click="closeDeleteAccountModal">close</button>
		</form>
	</dialog>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AuthService from '@/services/auth.service'
import TextInput from '@/components/ui/TextInput.vue'
const emit = defineEmits(['settings-updated'])
// Refs
const twoFAModal = ref(null)
const deleteAccountModal = ref(null)
const isSaving = ref(false)
const loading = ref(true)
const deleteConfirmation = ref('')
// Account settings data with default values
const accountSettings = reactive({
	email: '',
	subscription: {
		plan: 'Free Plan',
		description: 'Unlimited babies with care tracking',
		price: '€0/month',
		status: 'Active',
		features: ['Unlimited babies', 'Analytics', 'Support']
	}
})
// Fetch user profile data
const fetchUserProfile = async () => {
	loading.value = true
	try {
		const profile = await AuthService.getProfile()
		// Update accountSettings with real user data
		accountSettings.email = profile.email
		// Update language if locale is available
		if (profile.locale) {
			accountSettings.language = profile.locale
		}
	} catch (err) {
		console.error('Error fetching user profile:', err)
	} finally {
		loading.value = false
	}
}
// Computed properties
const storagePercentage = computed(() => {
	return (accountSettings.storageUsed / accountSettings.storageLimit) * 100
})
// Methods
const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}
const saveAccountSettings = async () => {
	isSaving.value = true
	try {
		// Prepare data for API
		const updateData = {
			locale: accountSettings.language
		}
		// Save to backend
		const updatedProfile = await AuthService.updateProfile(updateData)
		// Update local data with response
		if (updatedProfile) {
			accountSettings.email = updatedProfile.email
			if (updatedProfile.locale) {
				accountSettings.language = updatedProfile.locale
			}
		}
		emit('settings-updated', { ...accountSettings })
		// Show success message using toast
		const toast = document.createElement('div')
		toast.className = 'toast toast-top toast-center'
		toast.innerHTML = `
			<div class="alert alert-success">
				<span>Account settings saved successfully!</span>
			</div>
		`
		document.body.appendChild(toast)
		setTimeout(() => {
			document.body.removeChild(toast)
		}, 3000)
	} catch (error) {
		console.error('Error saving settings:', error)
		// Show error message
		const errorMessage = error.response?.data?.message || 'Failed to save settings. Please try again.'
		const toast = document.createElement('div')
		toast.className = 'toast toast-top toast-center'
		toast.innerHTML = `
			<div class="alert alert-error">
				<span>${errorMessage}</span>
			</div>
		`
		document.body.appendChild(toast)
		setTimeout(() => {
			document.body.removeChild(toast)
		}, 3000)
	} finally {
		isSaving.value = false
	}
}
const resetSettings = () => {
	// Reset to default values
	accountSettings.theme = 'baby-light'
	accountSettings.language = 'en'
	accountSettings.dateFormat = 'DD/MM/YYYY'
	accountSettings.timeFormat = '24'
	accountSettings.temperatureUnit = 'celsius'
	accountSettings.autoBackup = true
	accountSettings.syncData = true
	accountSettings.offlineMode = false
}
const exportData = () => {
	// Implement data export
}
const downloadBackup = () => {
	// Implement backup download
}
const open2FAModal = () => {
	twoFAModal.value?.showModal()
}
const close2FAModal = () => {
	twoFAModal.value?.close()
}
const openDeleteAccountModal = () => {
	deleteConfirmation.value = ''
	deleteAccountModal.value?.showModal()
}
const closeDeleteAccountModal = () => {
	deleteAccountModal.value?.close()
	deleteConfirmation.value = ''
}
const confirmDeleteAccount = () => {
	// Implement account deletion
	closeDeleteAccountModal()
}
// Initialize component
onMounted(async () => {
	await fetchUserProfile()
})
</script>