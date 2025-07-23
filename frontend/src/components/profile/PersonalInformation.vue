<template>
	<h3 class="card-title mb-6">Personal Information</h3>

	<!-- Loading indicator -->
	<div v-if="loading" class="flex justify-center my-4">
		<span class="loading loading-spinner loading-md text-primary"></span>
	</div>

	<form v-if="!loading" @submit.prevent="savePersonalInfo" class="space-y-6">
		<!-- Basic Information -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<TextInput
				v-model="personalInfo.firstName"
				label="First Name"
				placeholder="Enter your first name"
				:error="errors.firstName"
				required
			/>

			<TextInput
				v-model="personalInfo.lastName"
				label="Last Name"
				placeholder="Enter your last name"
				:error="errors.lastName"
				required
			/>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<TextInput
				v-model="personalInfo.email"
				type="email"
				label="Email Address"
				placeholder="your.email@example.com"
				:error="errors.email"
				required
			/>
		</div>

		<!-- Bio/About -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<TextInput
				v-model="personalInfo.bio"
				type="textarea"
				label="About Me"
				placeholder="Tell us about yourself and your family..."
				maxlength="300"
				:rows="4"
				showCharCount
			/>
		</div>

		<!-- Action Buttons -->
		<div class="card-actions justify-end pt-6 border-t border-base-300">
			<button
				type="button"
				class="btn btn-ghost"
				@click="resetForm"
				:disabled="isSaving"
			>
				Reset Changes
			</button>
			<button
				type="submit"
				class="btn btn-primary"
				:class="{ 'loading': isSaving }"
				:disabled="isSaving"
			>
				{{ isSaving ? 'Saving...' : 'Save Changes' }}
			</button>
		</div>
	</form>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AuthService from '@/services/auth.service'
import TextInput from '@/components/ui/TextInput.vue'

const emit = defineEmits(['profile-updated'])

// Reactive data
const isSaving = ref(false)
const errors = ref({})
const loading = ref(true)

// Current date for date input max
const maxBirthDate = computed(() => {
	const today = new Date()
	today.setFullYear(today.getFullYear() - 13) // Minimum age 13
	return today.toISOString().split('T')[0]
})

// Personal information form with default values
const personalInfo = reactive({
	firstName: '',
	lastName: '',
	email: '',
	phone: '+49 123 456 7890', // Default value for fields not in API
	dateOfBirth: '1990-05-15', // Default value
	gender: 'female', // Default value
	language: 'en', // Default value
	country: 'DE', // Default value
	city: 'Berlin', // Default value
	timezone: 'Europe/Berlin', // Default value
	bio: 'Proud mom of twins Anna and Ben. Love sharing our parenting journey and learning from other families.', // Default value
})

// Original data for reset functionality
const originalData = { ...personalInfo }

// Fetch user profile data
const fetchUserProfile = async () => {
	loading.value = true
	
	try {
		const profile = await AuthService.getProfile()
		
		// Update personalInfo with real user data
		personalInfo.firstName = profile.firstName
		personalInfo.lastName = profile.lastName
		personalInfo.email = profile.email
		
		// Update timezone and locale if available
		if (profile.timezone) {
			personalInfo.timezone = profile.timezone
		}
		if (profile.locale) {
			personalInfo.language = profile.locale
		}
		
		// Update original data for reset functionality
		Object.assign(originalData, personalInfo)
	} catch (err) {
		console.error('Error fetching user profile:', err)
	} finally {
		loading.value = false
	}
}

// Validation
const validateForm = () => {
	errors.value = {}

	if (!personalInfo.firstName || personalInfo.firstName.trim().length < 2) {
		errors.value.firstName = 'First name must be at least 2 characters'
		return false
	}

	if (!personalInfo.lastName || personalInfo.lastName.trim().length < 2) {
		errors.value.lastName = 'Last name must be at least 2 characters'
		return false
	}

	if (!personalInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
		errors.value.email = 'Please enter a valid email address'
		return false
	}

	return true
}

// Methods
const savePersonalInfo = async () => {
	if (!validateForm()) return

	isSaving.value = true
	errors.value = {}

	try {
		// Prepare data for API
		const updateData = {
			firstName: personalInfo.firstName,
			lastName: personalInfo.lastName,
			email: personalInfo.email,
			timezone: personalInfo.timezone,
			locale: personalInfo.language
		}

		// Save to backend
		const updatedProfile = await AuthService.updateProfile(updateData)

		// Update local data with response
		if (updatedProfile) {
			personalInfo.firstName = updatedProfile.firstName
			personalInfo.lastName = updatedProfile.lastName
			personalInfo.email = updatedProfile.email
			
			if (updatedProfile.timezone) {
				personalInfo.timezone = updatedProfile.timezone
			}
			if (updatedProfile.locale) {
				personalInfo.language = updatedProfile.locale
			}
		}

		emit('profile-updated', { ...personalInfo })

		// Show success message using toast or alert
		const toast = document.createElement('div')
		toast.className = 'toast toast-top toast-center'
		toast.innerHTML = `
			<div class="alert alert-success">
				<span>Profile updated successfully!</span>
			</div>
		`
		document.body.appendChild(toast)
		setTimeout(() => {
			document.body.removeChild(toast)
		}, 3000)

		// Update original data for future resets
		Object.assign(originalData, personalInfo)
	} catch (error) {
		console.error('Error updating profile:', error)
		
		// Show error message
		const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.'
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

const resetForm = () => {
	Object.assign(personalInfo, originalData)
	errors.value = {}
}

// Initialize component
onMounted(async () => {
	await fetchUserProfile()
})
</script>