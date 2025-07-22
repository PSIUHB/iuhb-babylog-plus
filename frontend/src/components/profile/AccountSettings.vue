<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h3 class="card-title mb-6">Account Settings</h3>

			<!-- Account Status -->
			<div class="space-y-4 mb-6">
				<h4 class="text-lg font-semibold">Account Status</h4>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

					<div class="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
						<div class="flex items-center gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
							<div>
								<div class="font-semibold">2FA Enabled</div>
								<div class="text-sm text-base-content/70">Extra security active</div>
							</div>
						</div>
						<button class="btn btn-ghost btn-sm" @click="open2FAModal">Configure</button>
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
							<p>Next billing: {{ formatDate(accountSettings.subscription.nextBilling) }}</p>
							<p>{{ accountSettings.subscription.features.length }} features included</p>
						</div>
					</div>
				</div>
			</div>

			<!-- App Preferences -->
			<form @submit.prevent="saveAccountSettings" class="space-y-6">
				<div class="space-y-4">
					<h4 class="text-lg font-semibold">App Preferences</h4>

					<!-- Theme Selection -->
					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Theme</span>
						</label>
						<select v-model="accountSettings.theme" class="select select-bordered">
							<option value="baby-light">Baby Light (Default)</option>
							<option value="baby-dark">Baby Dark</option>
							<option value="auto">Auto (System)</option>
						</select>
						<label class="label">
							<span class="label-text-alt">Choose your preferred color theme</span>
						</label>
					</div>

					<!-- Language & Region -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">Display Language</span>
							</label>
							<select v-model="accountSettings.language" class="select select-bordered">
								<option value="en">English</option>
								<option value="de">Deutsch</option>
								<option value="fr">Français</option>
								<option value="es">Español</option>
								<option value="it">Italiano</option>
							</select>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">Date Format</span>
							</label>
							<select v-model="accountSettings.dateFormat" class="select select-bordered">
								<option value="DD/MM/YYYY">DD/MM/YYYY</option>
								<option value="MM/DD/YYYY">MM/DD/YYYY</option>
								<option value="YYYY-MM-DD">YYYY-MM-DD</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">Time Format</span>
							</label>
							<select v-model="accountSettings.timeFormat" class="select select-bordered">
								<option value="12">12-hour (AM/PM)</option>
								<option value="24">24-hour</option>
							</select>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">Temperature Unit</span>
							</label>
							<select v-model="accountSettings.temperatureUnit" class="select select-bordered">
								<option value="celsius">Celsius (°C)</option>
								<option value="fahrenheit">Fahrenheit (°F)</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Data & Storage -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold">Data & Storage</h4>

					<div class="space-y-3">
						<label class="label cursor-pointer">
							<span class="label-text">Auto-backup to cloud</span>
							<input
								type="checkbox"
								v-model="accountSettings.autoBackup"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<span class="label-text">Sync data across devices</span>
							<input
								type="checkbox"
								v-model="accountSettings.syncData"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<span class="label-text">Offline mode (save data locally)</span>
							<input
								type="checkbox"
								v-model="accountSettings.offlineMode"
								class="checkbox checkbox-primary"
							/>
						</label>
					</div>

					<!-- Storage Usage -->
					<div class="p-4 bg-base-200 rounded-lg">
						<div class="flex justify-between items-center mb-2">
							<span class="text-sm font-semibold">Storage Used</span>
							<span class="text-sm">{{ accountSettings.storageUsed }}MB / {{ accountSettings.storageLimit }}MB</span>
						</div>
						<progress
							class="progress progress-primary w-full"
							:value="storagePercentage"
							max="100"
						></progress>
						<div class="text-xs text-base-content/60 mt-1">
							{{ accountSettings.storageLimit - accountSettings.storageUsed }}MB remaining
						</div>
					</div>
				</div>

				<!-- Account Actions -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold">Account Actions</h4>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<button
							type="button"
							class="btn btn-outline"
							@click="exportData"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m3 0a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Export My Data
						</button>

						<button
							type="button"
							class="btn btn-outline"
							@click="downloadBackup"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
							</svg>
							Download Backup
						</button>
					</div>
				</div>

				<!-- Danger Zone -->
				<div class="space-y-4 pt-6 border-t border-error/20">
					<h4 class="text-lg font-semibold text-error">Danger Zone</h4>

					<div class="card bg-error/5 border border-error/20">
						<div class="card-body">
							<h5 class="font-bold text-error">Delete Account</h5>
							<p class="text-sm text-base-content/70 mb-4">
								Permanently delete your account and all associated data. This action cannot be undone.
							</p>
							<button
								type="button"
								class="btn btn-error btn-sm"
								@click="openDeleteAccountModal"
							>
								Delete My Account
							</button>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="card-actions justify-end pt-6 border-t border-base-300">
					<button
						type="button"
						class="btn btn-ghost"
						@click="resetSettings"
						:disabled="isSaving"
					>
						Reset to Default
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						:class="{ 'loading': isSaving }"
						:disabled="isSaving"
					>
						{{ isSaving ? 'Saving...' : 'Save Settings' }}
					</button>
				</div>
			</form>
		</div>

		<!-- 2FA Configuration Modal -->
		<dialog ref="twoFAModal" class="modal">
			<div class="modal-box">
				<h3 class="font-bold text-lg mb-4">Two-Factor Authentication</h3>

				<div class="space-y-4">
					<div class="alert alert-info">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>2FA is currently enabled for your account</span>
					</div>

					<div class="space-y-3">
						<button class="btn btn-outline btn-block">View Recovery Codes</button>
						<button class="btn btn-outline btn-block">Regenerate Recovery Codes</button>
						<button class="btn btn-error btn-outline btn-block">Disable 2FA</button>
					</div>
				</div>

				<div class="modal-action">
					<button class="btn btn-ghost" @click="close2FAModal">Close</button>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button @click="close2FAModal">close</button>
			</form>
		</dialog>

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

					<div class="form-control">
						<label class="label">
							<span class="label-text">Type <strong>DELETE</strong> to confirm:</span>
						</label>
						<input
							type="text"
							v-model="deleteConfirmation"
							class="input input-bordered"
							placeholder="DELETE"
						/>
					</div>
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
	</div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const emit = defineEmits(['settings-updated'])

// Refs
const twoFAModal = ref(null)
const deleteAccountModal = ref(null)
const isSaving = ref(false)
const deleteConfirmation = ref('')

// Account settings data
const accountSettings = reactive({
	email: 'sarah.johnson@example.com',
	subscription: {
		plan: 'Premium Plan',
		description: 'Unlimited babies, advanced analytics, priority support',
		price: '€9.99/month',
		status: 'Active',
		nextBilling: '2024-07-15',
		features: ['Unlimited babies', 'Advanced analytics', 'Export data', 'Priority support']
	},
	theme: 'baby-light',
	language: 'en',
	dateFormat: 'DD/MM/YYYY',
	timeFormat: '24',
	temperatureUnit: 'celsius',
	autoBackup: true,
	syncData: true,
	offlineMode: false,
	storageUsed: 125,
	storageLimit: 1000
})

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
		await new Promise(resolve => setTimeout(resolve, 1000))

		emit('settings-updated', { ...accountSettings })
		console.log('Account settings saved successfully!')
	} catch (error) {
		console.error('Error saving settings:', error)
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
	console.log('Exporting user data...')
	// Implement data export
}

const downloadBackup = () => {
	console.log('Downloading backup...')
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
	console.log('Account deletion confirmed')
	// Implement account deletion
	closeDeleteAccountModal()
}
</script>