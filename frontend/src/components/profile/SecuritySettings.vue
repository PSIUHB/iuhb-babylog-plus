<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h3 class="card-title mb-6">Security Settings</h3>

			<!-- Password Change -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Change Password</h4>

				<form @submit.prevent="changePassword" class="space-y-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Current Password *</span>
						</label>
						<input
							type="password"
							v-model="passwordForm.currentPassword"
							placeholder="Enter your current password"
							class="input input-bordered"
							:class="{ 'input-error': passwordErrors.currentPassword }"
							required
						/>
						<label class="label" v-if="passwordErrors.currentPassword">
							<span class="label-text-alt text-error">{{ passwordErrors.currentPassword }}</span>
						</label>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">New Password *</span>
							</label>
							<input
								type="password"
								v-model="passwordForm.newPassword"
								placeholder="Enter new password"
								class="input input-bordered"
								:class="{ 'input-error': passwordErrors.newPassword }"
								required
							/>
							<label class="label" v-if="passwordErrors.newPassword">
								<span class="label-text-alt text-error">{{ passwordErrors.newPassword }}</span>
							</label>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">Confirm New Password *</span>
							</label>
							<input
								type="password"
								v-model="passwordForm.confirmPassword"
								placeholder="Confirm new password"
								class="input input-bordered"
								:class="{ 'input-error': passwordErrors.confirmPassword }"
								required
							/>
							<label class="label" v-if="passwordErrors.confirmPassword">
								<span class="label-text-alt text-error">{{ passwordErrors.confirmPassword }}</span>
							</label>
						</div>
					</div>

					<!-- Password Strength Indicator -->
					<div class="space-y-2">
						<div class="flex justify-between items-center">
							<span class="text-sm">Password Strength:</span>
							<span
								class="text-sm font-semibold"
								:class="passwordStrengthColor"
							>
                {{ passwordStrengthText }}
              </span>
						</div>
						<progress
							class="progress w-full"
							:class="passwordStrengthProgressClass"
							:value="passwordStrengthValue"
							max="100"
						></progress>

						<!-- Password Requirements -->
						<div class="text-xs space-y-1">
							<div :class="{ 'text-success': hasMinLength, 'text-base-content/60': !hasMinLength }">
								{{ hasMinLength ? '✓' : '○' }} At least 8 characters
							</div>
							<div :class="{ 'text-success': hasUppercase, 'text-base-content/60': !hasUppercase }">
								{{ hasUppercase ? '✓' : '○' }} Contains uppercase letter
							</div>
							<div :class="{ 'text-success': hasLowercase, 'text-base-content/60': !hasLowercase }">
								{{ hasLowercase ? '✓' : '○' }} Contains lowercase letter
							</div>
							<div :class="{ 'text-success': hasNumber, 'text-base-content/60': !hasNumber }">
								{{ hasNumber ? '✓' : '○' }} Contains number
							</div>
							<div :class="{ 'text-success': hasSpecial, 'text-base-content/60': !hasSpecial }">
								{{ hasSpecial ? '✓' : '○' }} Contains special character
							</div>
						</div>
					</div>

					<div class="flex gap-2">
						<button
							type="submit"
							class="btn btn-primary"
							:class="{ 'loading': isChangingPassword }"
							:disabled="isChangingPassword || passwordStrengthValue < 60"
						>
							{{ isChangingPassword ? 'Changing...' : 'Change Password' }}
						</button>
						<button
							type="button"
							class="btn btn-ghost"
							@click="resetPasswordForm"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>

			<!-- Two-Factor Authentication -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Two-Factor Authentication</h4>

				<div class="card bg-primary/5 border border-primary/20">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
								</svg>
								<div>
									<h5 class="font-bold">2FA Enabled</h5>
									<p class="text-sm text-base-content/70">Your account is protected with two-factor authentication</p>
								</div>
							</div>
							<button class="btn btn-outline btn-sm" @click="manage2FA">
								Manage
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Active Sessions -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Active Sessions</h4>

				<div class="space-y-3">
					<div
						v-for="session in activeSessions"
						:key="session.id"
						class="flex items-center justify-between p-4 border border-base-300 rounded-lg"
					>
						<div class="flex items-center gap-3">
							<div class="avatar placeholder">
								<div class="bg-neutral text-neutral-content rounded-full w-10">
									<span class="text-lg">{{ session.device.charAt(0) }}</span>
								</div>
							</div>
							<div>
								<div class="font-semibold">{{ session.device }}</div>
								<div class="text-sm text-base-content/70">{{ session.location }}</div>
								<div class="text-xs text-base-content/60">{{ session.lastActive }}</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<div
								v-if="session.current"
								class="badge badge-success badge-sm"
							>
								Current
							</div>
							<button
								v-else
								class="btn btn-ghost btn-sm text-error"
								@click="terminateSession(session.id)"
							>
								Terminate
							</button>
						</div>
					</div>
				</div>

				<button class="btn btn-outline btn-sm" @click="terminateAllSessions">
					Terminate All Other Sessions
				</button>
			</div>

			<!-- Security Preferences -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Security Preferences</h4>

				<div class="space-y-4">
					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Email login notifications</span>
							<div class="label-text-alt">Get notified when someone signs into your account</div>
						</div>
						<input
							type="checkbox"
							v-model="securitySettings.emailLoginNotifications"
							class="checkbox checkbox-primary"
						/>
					</label>

					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Require password for sensitive actions</span>
							<div class="label-text-alt">Ask for password before deleting data or changing security settings</div>
						</div>
						<input
							type="checkbox"
							v-model="securitySettings.requirePasswordForSensitive"
							class="checkbox checkbox-primary"
						/>
					</label>

					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Auto-logout on inactive sessions</span>
							<div class="label-text-alt">Automatically sign out after period of inactivity</div>
						</div>
						<input
							type="checkbox"
							v-model="securitySettings.autoLogout"
							class="checkbox checkbox-primary"
						/>
					</label>

					<div v-if="securitySettings.autoLogout" class="pl-6">
						<div class="form-control">
							<label class="label">
								<span class="label-text">Auto-logout after:</span>
							</label>
							<select v-model="securitySettings.autoLogoutDuration" class="select select-bordered select-sm">
								<option value="15">15 minutes</option>
								<option value="30">30 minutes</option>
								<option value="60">1 hour</option>
								<option value="120">2 hours</option>
								<option value="480">8 hours</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			<!-- Recent Security Activity -->
			<div class="space-y-6">
				<h4 class="text-lg font-semibold">Recent Security Activity</h4>

				<div class="space-y-2">
					<div
						v-for="activity in securityActivity"
						:key="activity.id"
						class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-full flex items-center justify-center"
								:class="getActivityIconClass(activity.type)"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										:d="getActivityIconPath(activity.type)"
									/>
								</svg>
							</div>
							<div>
								<div class="text-sm font-semibold">{{ activity.action }}</div>
								<div class="text-xs text-base-content/60">{{ activity.details }}</div>
							</div>
						</div>
						<div class="text-xs text-base-content/60">{{ activity.timestamp }}</div>
					</div>
				</div>
			</div>

			<!-- Save Settings -->
			<div class="card-actions justify-end pt-6 border-t border-base-300">
				<button
					class="btn btn-primary"
					:class="{ 'loading': isSavingSettings }"
					:disabled="isSavingSettings"
					@click="saveSecuritySettings"
				>
					{{ isSavingSettings ? 'Saving...' : 'Save Security Settings' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const emit = defineEmits(['security-updated'])

// Reactive data
const isChangingPassword = ref(false)
const isSavingSettings = ref(false)
const passwordErrors = ref({})

// Password form
const passwordForm = reactive({
	currentPassword: '',
	newPassword: '',
	confirmPassword: ''
})

// Security settings
const securitySettings = reactive({
	emailLoginNotifications: true,
	requirePasswordForSensitive: true,
	autoLogout: true,
	autoLogoutDuration: '60'
})

// Active sessions data
const activeSessions = ref([
	{
		id: 1,
		device: 'Chrome on Windows',
		location: 'Berlin, Germany',
		lastActive: 'Active now',
		current: true
	},
	{
		id: 2,
		device: 'Safari on iPhone',
		location: 'Berlin, Germany',
		lastActive: '2 hours ago',
		current: false
	},
	{
		id: 3,
		device: 'Firefox on macOS',
		location: 'Munich, Germany',
		lastActive: '1 day ago',
		current: false
	}
])

// Security activity data
const securityActivity = ref([
	{
		id: 1,
		type: 'login',
		action: 'Successful login',
		details: 'Chrome on Windows - Berlin, Germany',
		timestamp: '2 minutes ago'
	},
	{
		id: 2,
		type: 'password',
		action: 'Password changed',
		details: 'Password updated successfully',
		timestamp: '3 days ago'
	},
	{
		id: 3,
		type: '2fa',
		action: '2FA enabled',
		details: 'Two-factor authentication activated',
		timestamp: '1 week ago'
	},
	{
		id: 4,
		type: 'login',
		action: 'Failed login attempt',
		details: 'Invalid password - Unknown location',
		timestamp: '2 weeks ago'
	}
])

// Password strength computed properties
const hasMinLength = computed(() => passwordForm.newPassword.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(passwordForm.newPassword))
const hasLowercase = computed(() => /[a-z]/.test(passwordForm.newPassword))
const hasNumber = computed(() => /\d/.test(passwordForm.newPassword))
const hasSpecial = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword))

const passwordStrengthValue = computed(() => {
	const checks = [hasMinLength.value, hasUppercase.value, hasLowercase.value, hasNumber.value, hasSpecial.value]
	const score = checks.filter(Boolean).length
	return (score / 5) * 100
})

const passwordStrengthText = computed(() => {
	const value = passwordStrengthValue.value
	if (value === 0) return 'No password'
	if (value < 40) return 'Weak'
	if (value < 60) return 'Fair'
	if (value < 80) return 'Good'
	return 'Strong'
})

const passwordStrengthColor = computed(() => {
	const value = passwordStrengthValue.value
	if (value < 40) return 'text-error'
	if (value < 60) return 'text-warning'
	if (value < 80) return 'text-info'
	return 'text-success'
})

const passwordStrengthProgressClass = computed(() => {
	const value = passwordStrengthValue.value
	if (value < 40) return 'progress-error'
	if (value < 60) return 'progress-warning'
	if (value < 80) return 'progress-info'
	return 'progress-success'
})

// Methods
const validatePasswordForm = () => {
	passwordErrors.value = {}

	if (!passwordForm.currentPassword) {
		passwordErrors.value.currentPassword = 'Current password is required'
		return false
	}

	if (passwordForm.newPassword.length < 8) {
		passwordErrors.value.newPassword = 'Password must be at least 8 characters'
		return false
	}

	if (passwordForm.newPassword !== passwordForm.confirmPassword) {
		passwordErrors.value.confirmPassword = 'Passwords do not match'
		return false
	}

	return true
}

const changePassword = async () => {
	if (!validatePasswordForm()) return

	isChangingPassword.value = true

	try {
		await new Promise(resolve => setTimeout(resolve, 1500))

		emit('security-updated', {
			type: 'password_changed',
			timestamp: new Date()
		})

		resetPasswordForm()
		console.log('Password changed successfully!')
	} catch (error) {
		console.error('Error changing password:', error)
	} finally {
		isChangingPassword.value = false
	}
}

const resetPasswordForm = () => {
	passwordForm.currentPassword = ''
	passwordForm.newPassword = ''
	passwordForm.confirmPassword = ''
	passwordErrors.value = {}
}

const manage2FA = () => {
	console.log('Opening 2FA management...')
	// Implement 2FA management modal
}

const terminateSession = (sessionId) => {
	const index = activeSessions.value.findIndex(s => s.id === sessionId)
	if (index !== -1) {
		activeSessions.value.splice(index, 1)
		console.log(`Session ${sessionId} terminated`)
	}
}

const terminateAllSessions = () => {
	activeSessions.value = activeSessions.value.filter(s => s.current)
	console.log('All other sessions terminated')
}

const saveSecuritySettings = async () => {
	isSavingSettings.value = true

	try {
		await new Promise(resolve => setTimeout(resolve, 1000))

		emit('security-updated', {
			type: 'settings_updated',
			settings: { ...securitySettings },
			timestamp: new Date()
		})

		console.log('Security settings saved successfully!')
	} catch (error) {
		console.error('Error saving security settings:', error)
	} finally {
		isSavingSettings.value = false
	}
}

const getActivityIconClass = (type) => {
	switch (type) {
		case 'login': return 'bg-success text-success-content'
		case 'password': return 'bg-warning text-warning-content'
		case '2fa': return 'bg-primary text-primary-content'
		default: return 'bg-base-300 text-base-content'
	}
}

const getActivityIconPath = (type) => {
	switch (type) {
		case 'login': return 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
		case 'password': return 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
		case '2fa': return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
		default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	}
}
</script>