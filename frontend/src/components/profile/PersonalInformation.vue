<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h3 class="card-title mb-6">Personal Information</h3>

			<form @submit.prevent="savePersonalInfo" class="space-y-6">
				<!-- Basic Information -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">First Name *</span>
						</label>
						<input
							type="text"
							v-model="personalInfo.firstName"
							placeholder="Enter your first name"
							class="input input-bordered"
							:class="{ 'input-error': errors.firstName }"
							required
						/>
						<label class="label" v-if="errors.firstName">
							<span class="label-text-alt text-error">{{ errors.firstName }}</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Last Name *</span>
						</label>
						<input
							type="text"
							v-model="personalInfo.lastName"
							placeholder="Enter your last name"
							class="input input-bordered"
							:class="{ 'input-error': errors.lastName }"
							required
						/>
						<label class="label" v-if="errors.lastName">
							<span class="label-text-alt text-error">{{ errors.lastName }}</span>
						</label>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Email Address *</span>
						</label>
						<input
							type="email"
							v-model="personalInfo.email"
							placeholder="your.email@example.com"
							class="input input-bordered"
							:class="{ 'input-error': errors.email }"
							required
						/>
						<label class="label" v-if="errors.email">
							<span class="label-text-alt text-error">{{ errors.email }}</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Phone Number</span>
						</label>
						<input
							type="tel"
							v-model="personalInfo.phone"
							placeholder="+49 123 456 7890"
							class="input input-bordered"
						/>
						<label class="label">
							<span class="label-text-alt">Used for important notifications</span>
						</label>
					</div>
				</div>

				<!-- Additional Information -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Date of Birth</span>
						</label>
						<input
							type="date"
							v-model="personalInfo.dateOfBirth"
							class="input input-bordered"
							:max="maxBirthDate"
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Gender</span>
						</label>
						<select v-model="personalInfo.gender" class="select select-bordered">
							<option value="">Select gender</option>
							<option value="female">Female</option>
							<option value="male">Male</option>
							<option value="other">Other</option>
							<option value="prefer-not-to-say">Prefer not to say</option>
						</select>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Preferred Language</span>
						</label>
						<select v-model="personalInfo.language" class="select select-bordered">
							<option value="en">English</option>
							<option value="de">German</option>
							<option value="fr">French</option>
							<option value="es">Spanish</option>
							<option value="it">Italian</option>
						</select>
					</div>
				</div>

				<!-- Location Information -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold">Location Information</h4>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text">Country</span>
							</label>
							<select v-model="personalInfo.country" class="select select-bordered">
								<option value="">Select country</option>
								<option value="DE">Germany</option>
								<option value="US">United States</option>
								<option value="GB">United Kingdom</option>
								<option value="FR">France</option>
								<option value="ES">Spain</option>
								<option value="IT">Italy</option>
								<option value="AT">Austria</option>
								<option value="CH">Switzerland</option>
							</select>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text">City</span>
							</label>
							<input
								type="text"
								v-model="personalInfo.city"
								placeholder="Enter your city"
								class="input input-bordered"
							/>
						</div>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Time Zone</span>
						</label>
						<select v-model="personalInfo.timezone" class="select select-bordered">
							<option value="">Auto-detect from location</option>
							<option value="Europe/Berlin">Central European Time (CET)</option>
							<option value="Europe/London">Greenwich Mean Time (GMT)</option>
							<option value="America/New_York">Eastern Standard Time (EST)</option>
							<option value="America/Los_Angeles">Pacific Standard Time (PST)</option>
							<option value="Asia/Tokyo">Japan Standard Time (JST)</option>
							<option value="Australia/Sydney">Australian Eastern Time (AET)</option>
						</select>
					</div>
				</div>

				<!-- Bio/About -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">About Me</span>
					</label>
					<textarea
						v-model="personalInfo.bio"
						placeholder="Tell us about yourself and your family..."
						class="textarea textarea-bordered h-24"
						maxlength="300"
					></textarea>
					<label class="label">
						<span class="label-text-alt">{{ personalInfo.bio?.length || 0 }}/300 characters</span>
					</label>
				</div>

				<!-- Emergency Contact -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold">Emergency Contact</h4>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text">Contact Name</span>
							</label>
							<input
								type="text"
								v-model="personalInfo.emergencyContact.name"
								placeholder="Full name"
								class="input input-bordered"
							/>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text">Relationship</span>
							</label>
							<select v-model="personalInfo.emergencyContact.relationship" class="select select-bordered">
								<option value="">Select relationship</option>
								<option value="spouse">Spouse/Partner</option>
								<option value="parent">Parent</option>
								<option value="sibling">Sibling</option>
								<option value="friend">Friend</option>
								<option value="other">Other</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text">Phone Number</span>
							</label>
							<input
								type="tel"
								v-model="personalInfo.emergencyContact.phone"
								placeholder="+49 123 456 7890"
								class="input input-bordered"
							/>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text">Email</span>
							</label>
							<input
								type="email"
								v-model="personalInfo.emergencyContact.email"
								placeholder="contact@example.com"
								class="input input-bordered"
							/>
						</div>
					</div>
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
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const emit = defineEmits(['profile-updated'])

// Reactive data
const isSaving = ref(false)
const errors = ref({})

// Current date for date input max
const maxBirthDate = computed(() => {
	const today = new Date()
	today.setFullYear(today.getFullYear() - 13) // Minimum age 13
	return today.toISOString().split('T')[0]
})

// Personal information form
const personalInfo = reactive({
	firstName: 'Sarah',
	lastName: 'Johnson',
	email: 'sarah.johnson@example.com',
	phone: '+49 123 456 7890',
	dateOfBirth: '1990-05-15',
	gender: 'female',
	language: 'en',
	country: 'DE',
	city: 'Berlin',
	timezone: 'Europe/Berlin',
	bio: 'Proud mom of twins Anna and Ben. Love sharing our parenting journey and learning from other families.',
	emergencyContact: {
		name: 'Michael Johnson',
		relationship: 'spouse',
		phone: '+49 987 654 3210',
		email: 'michael.johnson@example.com'
	}
})

// Original data for reset functionality
const originalData = { ...personalInfo }

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

	try {
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1500))

		emit('profile-updated', { ...personalInfo })

		// Show success message
		console.log('Profile updated successfully!')

		// Update original data for future resets
		Object.assign(originalData, personalInfo)
	} catch (error) {
		console.error('Error updating profile:', error)
	} finally {
		isSaving.value = false
	}
}

const resetForm = () => {
	Object.assign(personalInfo, originalData)
	errors.value = {}
}
</script>