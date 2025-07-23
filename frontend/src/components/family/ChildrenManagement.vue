<template>
 <div class="flex items-center justify-between mb-6">
		<button
			v-if="hasPermission(Permission.EDIT_CHILDREN)"
			class="btn btn-primary ms-auto"
			@click="openAddChildModal"
		>
			Add Child
		</button>
	</div>

	<!-- Loading State -->
	<div v-if="loading" class="flex justify-center py-8">
		<div class="loading loading-spinner loading-md text-primary"></div>
	</div>

	<!-- Error State -->
	<div v-else-if="error" class="alert alert-error">
		<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
		<span>{{ error }}</span>
	</div>

	<!-- Empty State -->
	<div v-else-if="children.length === 0" class="text-center py-8">
		<div class="text-base-content/50 mb-4">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
			<p>No children added yet</p>
		</div>
  <button
			v-if="hasPermission(Permission.EDIT_CHILDREN)"
			class="btn btn-primary btn-sm"
			@click="openAddChildModal"
		>
			Add Your First Child
		</button>
	</div>

	<!-- Children List -->
	<div v-else class="space-y-4">
		<div
			v-for="child in children"
			:key="child.id"
			class="border border-base-300 rounded-lg p-4 hover:shadow-md transition-shadow"
		>
			<div class="flex items-center gap-4">
				<!-- Child Avatar -->
				<Avatar
					:src="child.avatarUrl"
					:name="child.firstName && child.lastName ? `${child.firstName} ${child.lastName}` : (child.name || 'Child')"
					size="lg"
					bgColor="6366f1"
				/>

				<!-- Child Information -->
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-1">
						<h3 class="font-bold text-lg">
							{{ child.firstName && child.lastName ? `${child.firstName} ${child.lastName}` : child.name }}
						</h3>
					</div>
					<div class="text-sm text-base-content/70 space-y-1">
						<p><strong>Born:</strong> {{ formatDate(child.birthDate) }} ({{ getAge(child.birthDate) }})</p>
						<p><strong>Gender:</strong> {{ child.gender }}</p>
						<p v-if="child.birthWeightKg"><strong>Birth Weight:</strong> {{ child.birthWeightKg }} kg</p>
						<p v-if="child.birthHeightCm"><strong>Birth Height:</strong> {{ child.birthHeightCm }} cm</p>
						<p v-if="child.notes"><strong>Notes:</strong> {{ child.notes }}</p>
					</div>
				</div>

    <!-- Action Buttons -->
				<div class="flex gap-2">
					<button
						v-if="hasPermission(Permission.EDIT_CHILDREN)"
						class="btn btn-ghost btn-sm"
						@click="editChild(child)"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</button>
					<div class="dropdown dropdown-end" v-if="hasPermission(Permission.EDIT_CHILDREN)">
						<div tabindex="0" role="button" class="btn btn-ghost btn-sm">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
							</svg>
						</div>
						<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
							<li>
								<a @click="toggleChildStatus(child)">
									{{ child.status === 'active' ? 'Deactivate' : 'Activate' }}
								</a>
							</li>
							<li>
								<a @click="deleteChild(child)" class="text-error">
									Delete Child
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Add/Edit Child Modal -->
	<dialog ref="childModal" class="modal">
		<div class="modal-box w-11/12 max-w-2xl">
			<h3 class="font-bold text-lg mb-4">
				{{ isEditing ? 'Edit Child' : 'Add New Child' }}
			</h3>

			<form @submit.prevent="saveChild" class="space-y-4">
				<!-- Basic Information -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<TextInput
						v-model="childForm.firstName"
						label="First Name *"
						placeholder="Enter child's first name"
						:error="childErrors.firstName"
						required
					/>

					<TextInput
						v-model="childForm.lastName"
						label="Last Name *"
						placeholder="Enter child's last name"
						:error="childErrors.lastName"
						required
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<TextInput
						v-model="childForm.birthDate"
						type="date"
						label="Birth Date *"
						:error="childErrors.birthDate"
						:max="today"
						required
					/>

					<SelectInput
						v-model="childForm.gender"
						label="Gender"
						placeholder="Select gender"
						:options="genderOptions"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<TextInput
						v-model="childForm.birthWeightKg"
						type="number"
						label="Birth Weight (kg)"
						placeholder="e.g., 3.5"
						step="0.01"
						min="0"
					/>

					<TextInput
						v-model="childForm.birthHeightCm"
						type="number"
						label="Birth Height (cm)"
						placeholder="e.g., 50"
						step="0.1"
						min="0"
					/>
				</div>
				
				<!-- Avatar Upload Section -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Child Avatar</span>
					</label>
					
					<div class="flex items-center gap-4">
						<!-- Avatar Preview -->
						<Avatar
							:src="avatarPreview || childForm.avatarUrl"
							:name="childForm.firstName && childForm.lastName ? `${childForm.firstName} ${childForm.lastName}` : (childForm.firstName || 'Child')"
							size="xl"
							bgColor="6366f1"
						/>
						
						<!-- Upload Controls -->
						<div class="flex-1">
							<input
								type="file"
								class="file-input file-input-bordered w-full max-w-xs"
								accept="image/*"
								@change="handleAvatarUpload"
							/>
							<div class="text-xs text-base-content/70 mt-1">
								Max size: 5MB. Formats: JPG, PNG, GIF
							</div>
						</div>
					</div>
				</div>


				<!-- Additional Information -->
				<TextInput
					v-model="childForm.notes"
					type="textarea"
					label="Notes"
					placeholder="Any special notes about your child..."
					maxlength="500"
					:rows="5"
					showCharCount
				/>

				<!-- Status -->
				<div class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Active child (appears in dashboard)</span>
						<input
							type="checkbox"
							v-model="childForm.isActive"
							class="checkbox checkbox-primary"
						/>
					</label>
				</div>

				<!-- Modal Actions -->
				<div class="modal-action">
					<button
						type="button"
						class="btn btn-ghost"
						@click="closeChildModal"
						:disabled="isSavingChild"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						:disabled="isSavingChild"
					>
						<span v-if="isSavingChild" class="loading loading-spinner loading-xs mr-2"></span>
						{{ isSavingChild ? 'Saving...' : (isEditing ? 'Update Child' : 'Add Child') }}
					</button>
				</div>
			</form>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button @click="closeChildModal">close</button>
		</form>
	</dialog>

	<!-- Delete Confirmation Modal -->
	<dialog ref="deleteModal" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg text-error mb-4">Delete Child</h3>
			<p class="mb-4">
				Are you sure you want to delete <strong>{{ childToDelete?.name }}</strong>?
			</p>
			<p class="text-sm text-base-content/70 mb-6">
				This will permanently remove all data associated with this child. This action cannot be undone.
			</p>

			<div class="modal-action">
				<button
					class="btn btn-ghost"
					@click="closeDeleteModal"
					:disabled="isDeleting"
				>
					Cancel
				</button>
				<button
					class="btn btn-error"
					:disabled="isDeleting"
					@click="confirmDelete"
				>
					<span v-if="isDeleting" class="loading loading-spinner loading-xs mr-2"></span>
					{{ isDeleting ? 'Deleting...' : 'Delete Child' }}
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button @click="closeDeleteModal">close</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import ChildrenService from '@/services/children.service'
import MediaService from '@/services/media.service'
import { usePermissions, Permission } from '@/services/permissions.service'
import TextInput from '@/components/ui/TextInput.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import Avatar from '@/components/ui/Avatar.vue'

const props = defineProps({
	familyId: {
		type: String,
		required: true
	}
})

const emit = defineEmits(['child-added', 'child-updated', 'child-deleted'])

// Refs
const childModal = ref(null)
const deleteModal = ref(null)
const isSavingChild = ref(false)
const isDeleting = ref(false)
const isEditing = ref(false)
const childToDelete = ref(null)
const childErrors = ref({})
const loading = ref(false)
const error = ref(null)

// Get permissions
const { hasPermission } = usePermissions()

// Current date for date input max
const today = computed(() => {
	return new Date().toISOString().split('T')[0]
})

// Options for select inputs
const genderOptions = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

// Form data
const childForm = reactive({
	id: null,
	firstName: '',
	lastName: '',
	birthDate: '',
	gender: '',
	birthWeightKg: null,
	birthHeightCm: null,
	notes: '',
	isActive: true,
	avatarUrl: '',
	avatarFile: null
})

// Preview for avatar upload
const avatarPreview = ref('')
const isUploadingAvatar = ref(false)

// Children data
const children = ref([])

// Fetch children from API
const fetchChildren = async () => {
	if (!props.familyId) return

	loading.value = true
	error.value = null

	try {
		const response = await ChildrenService.getChildrenByFamily(props.familyId)
		
		// Check if the response is an error object
		if (response && response.error === true) {
			console.error('Error fetching children:', response.message)
			error.value = 'Failed to load children. Please try again.'
		} else {
			children.value = response || []
		}
	} catch (err) {
		console.error('Error fetching children:', err)
		error.value = 'Failed to load children. Please try again.'
	} finally {
		loading.value = false
	}
}

// Fetch children when familyId changes
watch(() => props.familyId, (newFamilyId) => {
	if (newFamilyId) {
		fetchChildren()
	}
}, { immediate: true })

// Methods
const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

const getAge = (birthDate) => {
	const today = new Date()
	const birth = new Date(birthDate)
	const diffTime = Math.abs(today - birth)
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	if (diffDays < 30) {
		return `${diffDays} days old`
	} else if (diffDays < 365) {
		const months = Math.floor(diffDays / 30)
		return `${months} month${months > 1 ? 's' : ''} old`
	} else {
		const years = Math.floor(diffDays / 365)
		return `${years} year${years > 1 ? 's' : ''} old`
	}
}

const openAddChildModal = () => {
	if (!hasPermission(Permission.EDIT_CHILDREN)) {
		alert('You do not have permission to add children')
		return
	}
	isEditing.value = false
	resetChildForm()
	childModal.value?.showModal()
}

const editChild = (child) => {
	if (!hasPermission(Permission.EDIT_CHILDREN)) {
		alert('You do not have permission to edit children')
		return
	}
	
	isEditing.value = true
	childForm.id = child.id
	
	// Handle firstName and lastName
	if (child.firstName) {
		childForm.firstName = child.firstName
	} else if (child.name) {
		// For backward compatibility with existing data
		const nameParts = child.name.split(' ')
		childForm.firstName = nameParts[0] || ''
		childForm.lastName = nameParts.slice(1).join(' ') || ''
	} else {
		childForm.firstName = ''
		childForm.lastName = ''
	}
	
	if (child.lastName) {
		childForm.lastName = child.lastName
	} else if (!child.firstName && !child.name) {
		childForm.lastName = ''
	}
	
	// Format birthDate to YYYY-MM-DD for the date input
	if (child.birthDate) {
		const date = new Date(child.birthDate)
		childForm.birthDate = date.toISOString().split('T')[0]
	} else {
		childForm.birthDate = ''
	}
	childForm.gender = child.gender
	
	
	childForm.birthWeightKg = child.birthWeightKg !== undefined ? child.birthWeightKg : null
	childForm.birthHeightCm = child.birthHeightCm !== undefined ? child.birthHeightCm : null
	childForm.notes = child.notes
	childForm.isActive = child.status === 'active'
	
	// Set avatar URL if available
	childForm.avatarUrl = child.avatarUrl || ''
	childForm.avatarFile = null
	avatarPreview.value = ''
	
	childModal.value?.showModal()
}

const validateChildForm = () => {
	childErrors.value = {}

	if (!childForm.firstName || childForm.firstName.trim().length < 2) {
		childErrors.value.firstName = 'First name must be at least 2 characters'
		return false
	}

	if (!childForm.lastName || childForm.lastName.trim().length < 2) {
		childErrors.value.lastName = 'Last name must be at least 2 characters'
		return false
	}

	if (!childForm.birthDate) {
		childErrors.value.birthDate = 'Birth date is required'
		return false
	}

	const birthDate = new Date(childForm.birthDate)
	const today = new Date()
	if (birthDate > today) {
		childErrors.value.birthDate = 'Birth date cannot be in the future'
		return false
	}

	// Validate birth weight and height if provided
	if (childForm.birthWeightKg !== null && childForm.birthWeightKg <= 0) {
		childErrors.value.birthWeightKg = 'Birth weight must be greater than 0'
		return false
	}

	if (childForm.birthHeightCm !== null && childForm.birthHeightCm <= 0) {
		childErrors.value.birthHeightCm = 'Birth height must be greater than 0'
		return false
	}

	return true
}

const saveChild = async () => {
	if (!validateChildForm()) return

	isSavingChild.value = true

	try {
		// Construct the full name from firstName and lastName for backward compatibility
		const fullName = `${childForm.firstName} ${childForm.lastName}`.trim()

		// Create base data without id
		const childData = {
			firstName: childForm.firstName,
			lastName: childForm.lastName,
			name: fullName, // Include name for backward compatibility
			birthDate: childForm.birthDate,
			gender: childForm.gender,
			notes: childForm.notes,
			status: childForm.isActive ? 'active' : 'inactive',
			// Convert string values to numbers for numeric fields
			birthWeightKg: childForm.birthWeightKg !== null ? Number(childForm.birthWeightKg) : null,
			birthHeightCm: childForm.birthHeightCm !== null ? Number(childForm.birthHeightCm) : null,
			// Include avatarUrl if it exists and no new file is being uploaded
			avatarUrl: childForm.avatarUrl && !childForm.avatarFile ? childForm.avatarUrl : undefined
		}

		let response;

		if (isEditing.value) {
			// Update existing child
			response = await ChildrenService.updateChild(childForm.id, childData)

			// If there's a new avatar file, upload it
			if (childForm.avatarFile) {
				isUploadingAvatar.value = true
				try {
					response = await ChildrenService.uploadAvatar(childForm.id, childForm.avatarFile)
				} catch (avatarError) {
					console.error('Error uploading avatar:', avatarError)
					// Continue with the save even if avatar upload fails
				} finally {
					isUploadingAvatar.value = false
				}
			}

			// Update local state
			const index = children.value.findIndex(c => c.id === childForm.id)
			if (index !== -1) {
				children.value[index] = { ...response }
			}

			emit('child-updated', response)
		} else {
			// Add new child
			response = await ChildrenService.createChild(props.familyId, childData)

			// If there's an avatar file, upload it
			if (childForm.avatarFile) {
				isUploadingAvatar.value = true
				try {
					response = await ChildrenService.uploadAvatar(response.id, childForm.avatarFile)
				} catch (avatarError) {
					console.error('Error uploading avatar:', avatarError)
					// Continue with the save even if avatar upload fails
				} finally {
					isUploadingAvatar.value = false
				}
			}

			// Update local state
			children.value.push(response)

			emit('child-added', response)
		}

		closeChildModal()

		// Show success message
		alert(isEditing.value ? 'Child updated successfully!' : 'Child added successfully!')
	} catch (error) {
		console.error('Error saving child:', error)
		alert('Error saving child. Please try again.')
	} finally {
		isSavingChild.value = false
	}
}

const deleteChild = (child) => {
	if (!hasPermission(Permission.EDIT_CHILDREN)) {
		alert('You do not have permission to delete children')
		return
	}
	childToDelete.value = child
	deleteModal.value?.showModal()
}

const confirmDelete = async () => {
	if (!childToDelete.value) return

	isDeleting.value = true

	try {
		await ChildrenService.deleteChild(childToDelete.value.id)

		// Update local state
		const index = children.value.findIndex(c => c.id === childToDelete.value.id)
		if (index !== -1) {
			children.value.splice(index, 1)
		}

		emit('child-deleted', childToDelete.value.id)
		closeDeleteModal()

		// Show success message
		alert('Child deleted successfully!')
	} catch (error) {
		console.error('Error deleting child:', error)
		alert('Error deleting child. Please try again.')
	} finally {
		isDeleting.value = false
	}
}

const toggleChildStatus = async (child) => {
	if (!hasPermission(Permission.EDIT_CHILDREN)) {
		alert('You do not have permission to change child status')
		return
	}
	
	try {
		const updatedStatus = child.status === 'active' ? 'inactive' : 'active'

		// Update child with new status
		const updatedChild = { ...child, status: updatedStatus }
		const response = await ChildrenService.updateChild(child.id, updatedChild)

		// Update local state
		const index = children.value.findIndex(c => c.id === child.id)
		if (index !== -1) {
			children.value[index] = { ...response }
		}

		emit('child-updated', response)
	} catch (error) {
		console.error('Error updating child status:', error)
		alert('Error updating child status. Please try again.')
	}
}

const handleAvatarUpload = (event) => {
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
	childForm.avatarFile = file
	
	// Create preview URL
	const reader = new FileReader()
	reader.onload = (e) => {
		avatarPreview.value = e.target.result
	}
	reader.readAsDataURL(file)
}

const resetChildForm = () => {
	childForm.id = null
	childForm.firstName = ''
	childForm.lastName = ''
	childForm.birthDate = ''
	childForm.gender = ''
	childForm.colorTheme = 'primary'
	childForm.birthWeightKg = null
	childForm.birthHeightCm = null
	childForm.notes = ''
	childForm.isActive = true
	childForm.avatarUrl = ''
	childForm.avatarFile = null
	avatarPreview.value = ''
	childErrors.value = {}
}

const closeChildModal = () => {
	childModal.value?.close()
	resetChildForm()
}

const closeDeleteModal = () => {
	deleteModal.value?.close()
	childToDelete.value = null
}
</script>
