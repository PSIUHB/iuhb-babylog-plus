<template>
	<form @submit.prevent="saveFamilySettings" class="space-y-6">
		<!-- Family Name -->
		<div class="form-control">
			<label class="label">
				<span class="label-text font-semibold">Family Name</span>
				<span class="label-text-alt text-error" v-if="errors.familyName">{{ errors.familyName }}</span>
			</label>
			<input
				type="text"
				v-model="familyData.name"
				placeholder="Enter your family name (e.g., The Johnson Family)"
				class="input input-bordered w-full"
				:class="{ 'input-error': errors.familyName }"
				maxlength="50"
			/>
			<label class="label">
				<span class="label-text-alt">This will be displayed in invitations and reports</span>
			</label>
		</div>

		<!-- Family Description -->
		<div class="form-control grid">
			<label class="label">
				<span class="label-text font-semibold">Family Description</span>
			</label>
			<textarea
				v-model="familyData.description"
				placeholder="Tell us about your family..."
				class="textarea textarea-bordered w-100"
				rows="5"
				maxlength="200"
			></textarea>
			<label class="label">
				<span class="label-text-alt">{{ familyData.description?.length || 0 }}/200 characters</span>
			</label>
		</div>

		<!-- Time Zone -->
		<div class="form-control">
			<label class="label">
				<span class="label-text font-semibold">Time Zone</span>
			</label>
			<select v-model="familyData.timezone" class="select select-bordered w-full">
				<option value="">Select your time zone</option>
				<option
					v-for="tz in timezones"
					:key="tz.value"
					:value="tz.value"
				>
					{{ tz.label }}
				</option>
			</select>
		</div>

		<!-- Privacy Settings -->
		<div class="form-control">
			<label class="label">
				<span class="label-text font-semibold">Privacy Settings</span>
			</label>
			<div class="space-y-3">
				<label class="label cursor-pointer">
					<input
						type="checkbox"
						v-model="familyData.allowPhotosInReports"
						class="checkbox checkbox-primary"
					/>
					<span class="label-text">Allow family photos in reports</span>
				</label>
			</div>
			<div class="space-y-3">
				<label class="label cursor-pointer">
					<input
						type="checkbox"
						v-model="familyData.shareAnonymousData"
						class="checkbox checkbox-primary"
					/>
					<span class="label-text">Share anonymous data for research</span>
				</label>
			</div>
			<div class="space-y-3">
				<label class="label cursor-pointer">
					<input
						type="checkbox"
						v-model="familyData.enableLocationTracking"
						class="checkbox checkbox-primary"
					/>
					<span class="label-text">Enable location tracking for caregivers</span>
				</label>
			</div>
		</div>

		<!-- Emergency Contact -->
		<div class="form-control">
			<label class="label">
				<span class="label-text font-semibold">Emergency Contact</span>
			</label>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<input
					type="text"
					v-model="familyData.emergencyContact.name"
					placeholder="Contact name"
					class="input input-bordered"
				/>
				<input
					type="tel"
					v-model="familyData.emergencyContact.phone"
					placeholder="Phone number"
					class="input input-bordered"
				/>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex mt-4">
			<div class="ms-auto">
				<button
					type="button"
					class="btn btn-ghost"
					@click="resetForm"
					:disabled="isSaving"
				>
					Reset
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
		</div>
	</form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const props = defineProps({
	family: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['family-updated'])

// Reactive data
const isSaving = ref(false)
const errors = ref({})
const children = ref([])

const familyData = reactive({
	name: '',
	description: '',
	timezone: 'Europe/Berlin',
	allowPhotosInReports: true,
	shareAnonymousData: false,
	enableLocationTracking: true,
	emergencyContact: {
		name: '',
		phone: ''
	}
})

// Update form data from family object
const updateFormFromFamily = (family) => {
	if (!family) return

	familyData.name = family.name || ''
	familyData.description = family.description || ''
	familyData.timezone = family.timezone || 'Europe/Berlin'

	// Set privacy settings with defaults if not present
	familyData.allowPhotosInReports = family.allowPhotosInReports !== undefined 
		? family.allowPhotosInReports 
		: true
	familyData.shareAnonymousData = family.shareAnonymousData !== undefined 
		? family.shareAnonymousData 
		: false
	familyData.enableLocationTracking = family.enableLocationTracking !== undefined 
		? family.enableLocationTracking 
		: true

	// Set emergency contact with defaults if not present
	familyData.emergencyContact = {
		name: family.emergencyContact?.name || '',
		phone: family.emergencyContact?.phone || ''
	}

	// Set children if available
	if (family.children && Array.isArray(family.children)) {
		children.value = family.children
	}
}

// Watch for changes in the family prop and update the form data
watch(() => props.family, (newFamily) => {
	if (newFamily) {
		updateFormFromFamily(newFamily)
	}
}, { immediate: true })

const timezones = ref([
	{ value: 'Europe/Berlin', label: 'Central European Time (CET)' },
	{ value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
	{ value: 'America/New_York', label: 'Eastern Standard Time (EST)' },
	{ value: 'America/Los_Angeles', label: 'Pacific Standard Time (PST)' },
	{ value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
	{ value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
])

// Validation
const validateForm = () => {
	errors.value = {}

	if (!familyData.name || familyData.name.trim().length < 2) {
		errors.value.familyName = 'Family name must be at least 2 characters'
		return false
	}

	return true
}

// Methods
const saveFamilySettings = async () => {
	if (!validateForm()) return

	isSaving.value = true

	try {
		// Prepare data for API
		const updateData = {
			name: familyData.name,
			description: familyData.description,
			timezone: familyData.timezone,
			allowPhotosInReports: familyData.allowPhotosInReports,
			shareAnonymousData: familyData.shareAnonymousData,
			enableLocationTracking: familyData.enableLocationTracking,
			emergencyContact: {
				name: familyData.emergencyContact.name,
				phone: familyData.emergencyContact.phone
			}
		}

		// Emit event to parent component to handle the API call
		emit('family-updated', updateData)

		// Show success message
		// This would be better with a toast notification system
		alert('Family settings saved successfully!')
	} catch (error) {
		console.error('Error saving family settings:', error)
		alert('Error saving family settings. Please try again.')
	} finally {
		isSaving.value = false
	}
}

const resetForm = () => {
	// Reset form to current family data
	updateFormFromFamily(props.family)
	errors.value = {}
}
</script>
