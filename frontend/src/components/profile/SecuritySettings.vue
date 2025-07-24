<template>
	<h3 class="card-title mb-6">Security Settings</h3>
	<!-- Loading indicator -->
	<div v-if="loading" class="flex justify-center my-4">
		<span class="loading loading-spinner loading-md text-primary"></span>
	</div>
	<!-- Password Change -->
	<div class="space-y-6 mb-8">
		<h4 class="text-lg font-semibold">Change Password</h4>
		<form @submit.prevent="changePassword" class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<TextInput
					v-model="passwordForm.currentPassword"
					type="password"
					label="Current Password"
					placeholder="Enter your current password"
					:error="passwordErrors.currentPassword"
					required
				/>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<TextInput
					v-model="passwordForm.newPassword"
					type="password"
					label="New Password"
					placeholder="Enter new password"
					:error="passwordErrors.newPassword"
					required
				/>
				<TextInput
					v-model="passwordForm.confirmPassword"
					type="password"
					label="Confirm New Password"
					placeholder="Confirm new password"
					:error="passwordErrors.confirmPassword"
					required
				/>
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
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AuthService from '@/services/auth.service'
import TextInput from '@/components/ui/TextInput.vue'
const emit = defineEmits(['security-updated'])
// Reactive data
const isChangingPassword = ref(false)
const isSavingSettings = ref(false)
const loading = ref(true)
const passwordErrors = ref({})
// Fetch user profile data
const fetchUserProfile = async () => {
	loading.value = true
	try {
		await AuthService.getProfile()
		// We don't need to store the profile data here,
		// just verify that the user is authenticated
	} catch (err) {
		console.error('Error fetching user profile:', err)
	} finally {
		loading.value = false
	}
}
// Password form
const passwordForm = reactive({
	currentPassword: '',
	newPassword: '',
	confirmPassword: ''
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
const terminateSession = (sessionId) => {
	const index = activeSessions.value.findIndex(s => s.id === sessionId)
	if (index !== -1) {
		activeSessions.value.splice(index, 1)
	}
}
const terminateAllSessions = () => {
	activeSessions.value = activeSessions.value.filter(s => s.current)
}
const saveSecuritySettings = async () => {
	isSavingSettings.value = true
	try {
		// In a real application, this would call an API endpoint to save security settings
		// For now, we'll simulate a successful save
		await new Promise(resolve => setTimeout(resolve, 1000))
		emit('security-updated', {
			type: 'settings_updated',
			timestamp: new Date()
		})
	} catch (error) {
		console.error('Error saving security settings:', error)
	} finally {
		isSavingSettings.value = false
	}
}
// Initialize component
onMounted(async () => {
	await fetchUserProfile()
})
</script>