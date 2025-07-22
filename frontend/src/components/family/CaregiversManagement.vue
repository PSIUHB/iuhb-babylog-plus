<template>
 <div class="flex items-center justify-between mb-6">
		<button
			v-if="canInviteCaregivers"
			class="btn btn-primary ms-auto"
			@click="openInviteModal"
		>
			Invite Caregiver
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
	<div v-else-if="caregivers.length === 0" class="text-center py-8">
		<div class="text-base-content/50 mb-4">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
			<p>No caregivers added yet</p>
		</div>
  <button
			v-if="canInviteCaregivers"
			class="btn btn-primary btn-sm"
			@click="openInviteModal"
		>
			Invite Your First Caregiver
		</button>
	</div>

	<!-- Caregivers List -->
	<div v-else class="space-y-4">
		<div
			v-for="caregiver in caregivers"
			:key="caregiver.id"
			class="border border-base-300 rounded-lg p-4 hover:shadow-md transition-shadow"
		>
			<div class="flex items-center gap-4">
				<!-- Caregiver Avatar -->
				<div
					class="avatar"
					:class="getAvatarStatusClass(caregiver)"
				>
					<div class="w-16 h-16 rounded-full">
						<img
							:src="caregiver.avatar || getDefaultAvatar(`${caregiver.firstName} ${caregiver.lastName}`)"
							:alt="`${caregiver.firstName} ${caregiver.lastName}`"
						/>
					</div>
				</div>

				<!-- Caregiver Information -->
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-1">
						<h3 class="font-bold text-lg">{{ `${caregiver.firstName} ${caregiver.lastName}` }}</h3>
						<div
							class="badge badge-sm"
							:class="getStatusBadgeClass(caregiver.status)"
						>
							{{ caregiver.status }}
						</div>
						<div
							v-if="caregiver.role === 'owner'"
							class="badge badge-primary badge-sm"
						>
							Owner
						</div>
					</div>
					<div class="text-sm text-base-content/70 space-y-1">
						<p><strong>Email:</strong> {{ caregiver.email }}</p>
						<p><strong>Role:</strong> {{ getRoleLabel(caregiver.role) }}</p>
						<p v-if="caregiver.phone"><strong>Phone:</strong> {{ caregiver.phone }}</p>
						<p><strong>Last Active:</strong> {{ formatLastActive(caregiver.lastActive) }}</p>
					</div>
				</div>

				<!-- Permissions section removed as permissions are now determined by role -->

				<!-- Action Buttons -->
				<div class="flex gap-2">
					<button
						v-if="canManageFamily"
						class="btn btn-ghost btn-sm"
						@click="editCaregiver(caregiver)"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</button>
					<div class="dropdown dropdown-end" v-if="caregiver.role !== 'owner' && canManageFamily">
						<div tabindex="0" role="button" class="btn btn-ghost btn-sm">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
							</svg>
						</div>
						<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
							<li v-if="caregiver.status === 'pending' && canInviteCaregivers">
								<a @click="resendInvitation(caregiver)">
									Resend Invitation
								</a>
							</li>
							<li v-if="canManageFamily">
								<a @click="removeCaregiver(caregiver)" class="text-error">
									Remove Caregiver
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Invite Caregiver Modal -->
	<dialog ref="inviteModal" class="modal">
		<div class="modal-box w-11/12 max-w-2xl">
			<h3 class="font-bold text-lg mb-4">Invite New Caregiver</h3>

			<form @submit.prevent="sendInvitation" class="space-y-4">
				<!-- Basic Information -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">First Name *</span>
						</label>
						<input
							type="text"
							v-model="inviteForm.firstName"
							placeholder="Enter first name"
							class="input input-bordered"
							:class="{ 'input-error': inviteErrors.firstName }"
							required
						/>
						<label class="label" v-if="inviteErrors.firstName">
							<span class="label-text-alt text-error">{{ inviteErrors.firstName }}</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Last Name *</span>
						</label>
						<input
							type="text"
							v-model="inviteForm.lastName"
							placeholder="Enter last name"
							class="input input-bordered"
							:class="{ 'input-error': inviteErrors.lastName }"
							required
						/>
						<label class="label" v-if="inviteErrors.lastName">
							<span class="label-text-alt text-error">{{ inviteErrors.lastName }}</span>
						</label>
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Email Address *</span>
					</label>
					<input
						type="email"
						v-model="inviteForm.email"
						placeholder="caregiver@example.com"
						class="input input-bordered"
						:class="{ 'input-error': inviteErrors.email }"
						required
					/>
					<label class="label" v-if="inviteErrors.email">
						<span class="label-text-alt text-error">{{ inviteErrors.email }}</span>
					</label>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">Phone Number</span>
						</label>
						<input
							type="tel"
							v-model="inviteForm.phone"
							placeholder="+49 123 456 7890"
							class="input input-bordered"
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Role</span>
						</label>
						<select v-model="inviteForm.role" class="select select-bordered">
							<option value="parent">Parent</option>
							<option value="caregiver">Caregiver</option>
							<option value="viewer">Viewer Only</option>
						</select>
					</div>
				</div>

				<!-- Permissions section removed as permissions are now determined by role -->

				<!-- Personal Message -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Personal Message (Optional)</span>
					</label>
					<textarea
						v-model="inviteForm.message"
						placeholder="Add a personal message to the invitation..."
						class="textarea textarea-bordered h-20"
						maxlength="300"
					></textarea>
					<label class="label">
						<span class="label-text-alt">{{ inviteForm.message?.length || 0 }}/300 characters</span>
					</label>
				</div>

				<!-- Modal Actions -->
				<div class="modal-action">
					<button
						type="button"
						class="btn btn-ghost"
						@click="closeInviteModal"
						:disabled="isSendingInvite"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						:class="{ 'loading': isSendingInvite }"
						:disabled="isSendingInvite"
					>
						{{ isSendingInvite ? 'Sending...' : 'Send Invitation' }}
					</button>
				</div>
			</form>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button @click="closeInviteModal">close</button>
		</form>
	</dialog>

	<!-- Edit Caregiver Modal -->
	<dialog ref="editModal" class="modal">
		<div class="modal-box w-11/12 max-w-2xl">
			<h3 class="font-bold text-lg mb-4">Edit Caregiver</h3>

			<form @submit.prevent="updateCaregiver" class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">First Name *</span>
						</label>
						<input
							type="text"
							v-model="editForm.firstName"
							class="input input-bordered"
							required
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Last Name *</span>
						</label>
						<input
							type="text"
							v-model="editForm.lastName"
							class="input input-bordered"
							required
						/>
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Role</span>
					</label>
					<select v-model="editForm.role" class="select select-bordered">
						<option value="parent">Parent</option>
						<option value="caregiver">Caregiver</option>
						<option value="viewer">Viewer Only</option>
					</select>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Phone Number</span>
					</label>
					<input
						type="tel"
						v-model="editForm.phone"
						class="input input-bordered"
					/>
				</div>

				<!-- Permissions section removed as permissions are now determined by role -->

				<!-- Modal Actions -->
				<div class="modal-action">
					<button
						type="button"
						class="btn btn-ghost"
						@click="closeEditModal"
						:disabled="isUpdating"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						:class="{ 'loading': isUpdating }"
						:disabled="isUpdating"
					>
						{{ isUpdating ? 'Updating...' : 'Update Caregiver' }}
					</button>
				</div>
			</form>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button @click="closeEditModal">close</button>
		</form>
	</dialog>

	<!-- Remove Confirmation Modal -->
	<dialog ref="removeModal" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg text-error mb-4">Remove Caregiver</h3>
			<p class="mb-4">
				Are you sure you want to remove <strong>{{ caregiverToRemove ? `${caregiverToRemove.firstName} ${caregiverToRemove.lastName}` : '' }}</strong> from your family?
			</p>
			<p class="text-sm text-base-content/70 mb-6">
				They will lose access to all family data and will need to be re-invited if you want to add them back.
			</p>

			<div class="modal-action">
				<button
					class="btn btn-ghost"
					@click="closeRemoveModal"
					:disabled="isRemoving"
				>
					Cancel
				</button>
				<button
					class="btn btn-error"
					:class="{ 'loading': isRemoving }"
					:disabled="isRemoving"
					@click="confirmRemove"
				>
					{{ isRemoving ? 'Removing...' : 'Remove Caregiver' }}
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button @click="closeRemoveModal">close</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import CaregiversService from '@/services/caregivers.service'
import { usePermissions, Permission } from '@/services/permissions.service'

const props = defineProps({
	familyId: {
		type: String,
		required: true
	}
})

const emit = defineEmits(['caregiver-invited', 'caregiver-updated', 'caregiver-removed'])

// Refs
const inviteModal = ref(null)
const editModal = ref(null)
const removeModal = ref(null)
const isSendingInvite = ref(false)
const isUpdating = ref(false)
const isRemoving = ref(false)
const caregiverToRemove = ref(null)
const inviteErrors = ref({})
const loading = ref(false)
const error = ref(null)

// Get permissions
const { hasPermission, permissions } = usePermissions()

// Get auth store to check current user
import { useAuthStore } from '@/stores/auth.store'
import { useFamilyStore } from '@/stores/family.store'
import { computed } from 'vue'

const authStore = useAuthStore()
const familyStore = useFamilyStore()

// Add computed properties to check if the current user has specific permissions
const canManageFamily = computed(() => {
  return hasPermission(Permission.MANAGE_FAMILY);
});

const canInviteCaregivers = computed(() => {
  return hasPermission(Permission.INVITE_CAREGIVERS);
});

// Forms
const inviteForm = reactive({
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	role: 'caregiver',
	message: ''
})

const editForm = reactive({
	id: null,
	firstName: '',
	lastName: '',
	phone: '',
	role: 'caregiver'
})

// Permissions are now determined by role, so we don't need to define available permissions

// Caregivers data
const caregivers = ref([])

// Fetch caregivers from API
const fetchCaregivers = async () => {
	if (!props.familyId) return

	loading.value = true
	error.value = null

	try {
		const response = await CaregiversService.getCaregiversByFamily(props.familyId)
		
		// Check if the response is an error object
		if (response && response.error === true) {
			console.error('Error fetching caregivers:', response.message)
			error.value = 'Failed to load caregivers. Please try again.'
		} else {
			caregivers.value = response || []
		}
	} catch (err) {
		console.error('Error fetching caregivers:', err)
		error.value = 'Failed to load caregivers. Please try again.'
	} finally {
		loading.value = false
	}
}

// Fetch caregivers when familyId changes
watch(() => props.familyId, (newFamilyId) => {
	if (newFamilyId) {
		fetchCaregivers()
	}
}, { immediate: true })

// Methods
const getAvatarStatusClass = (caregiver) => {
	if (caregiver.status === 'pending') return ''

	const now = new Date()
	const lastActive = new Date(caregiver.lastActive)
	const diffMinutes = (now - lastActive) / (1000 * 60)

	if (diffMinutes < 5) return 'avatar-online'
	if (diffMinutes < 60) return 'avatar-away'
	return 'avatar-offline'
}

const getStatusBadgeClass = (status) => {
	switch (status) {
		case 'active': return 'badge-success'
		case 'pending': return 'badge-warning'
		case 'inactive': return 'badge-error'
		default: return 'badge-ghost'
	}
}

const getRoleLabel = (role) => {
	const labels = {
		owner: 'Family Owner',
		parent: 'Parent',
		caregiver: 'Caregiver',
		viewer: 'Viewer Only'
	}
	return labels[role] || role
}

// getPermissionLabel function removed as permissions are now determined by role

const formatLastActive = (lastActive) => {
	if (!lastActive) return 'Never logged in'

	const now = new Date()
	const last = new Date(lastActive)
	const diffMinutes = Math.floor((now - last) / (1000 * 60))

	if (diffMinutes < 1) return 'Active now'
	if (diffMinutes < 60) return `${diffMinutes} min ago`

	const diffHours = Math.floor(diffMinutes / 60)
	if (diffHours < 24) return `${diffHours}h ago`

	const diffDays = Math.floor(diffHours / 24)
	return `${diffDays}d ago`
}

const getDefaultAvatar = (name) => {
	// Generate a default avatar based on name initials
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
}

const openInviteModal = () => {
	if (!canInviteCaregivers.value) {
		alert('You do not have permission to invite caregivers')
		return
	}
	resetInviteForm()
	inviteModal.value?.showModal()
}

const editCaregiver = (caregiver) => {
	if (!canManageFamily.value) {
		alert('You do not have permission to edit caregivers')
		return
	}
	editForm.id = caregiver.id
	editForm.firstName = caregiver.firstName
	editForm.lastName = caregiver.lastName
	editForm.phone = caregiver.phone || ''
	editForm.role = caregiver.role
	editModal.value?.showModal()
}

const validateInviteForm = () => {
	inviteErrors.value = {}
	let isValid = true

	if (!inviteForm.firstName || inviteForm.firstName.trim().length < 2) {
		inviteErrors.value.firstName = 'First name must be at least 2 characters'
		isValid = false
	}

	if (!inviteForm.lastName || inviteForm.lastName.trim().length < 2) {
		inviteErrors.value.lastName = 'Last name must be at least 2 characters'
		isValid = false
	}

	if (!inviteForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
		inviteErrors.value.email = 'Please enter a valid email address'
		isValid = false
	}

	// Check if email already exists
	if (caregivers.value.some(c => c.email === inviteForm.email)) {
		inviteErrors.value.email = 'This email is already associated with a caregiver'
		isValid = false
	}

	return isValid
}

const sendInvitation = async () => {
	if (!validateInviteForm()) return

	isSendingInvite.value = true

	try {
		// Only send the fields expected by the backend
		const inviteData = {
			email: inviteForm.email,
			role: inviteForm.role,
			message: inviteForm.message
		}
		
		const response = await CaregiversService.inviteCaregiver(props.familyId, inviteData)

		// Refresh caregivers list
		await fetchCaregivers()

		emit('caregiver-invited', response)
		closeInviteModal()

		// Show success message
		alert('Invitation sent successfully!')
	} catch (error) {
		console.error('Error sending invitation:', error)
		alert('Error sending invitation. Please try again.')
	} finally {
		isSendingInvite.value = false
	}
}

const updateCaregiver = async () => {
	isUpdating.value = true

	try {
		const caregiverData = {
			id: editForm.id,
			firstName: editForm.firstName,
			lastName: editForm.lastName,
			phone: editForm.phone,
			role: editForm.role
		}

		const response = await CaregiversService.updateCaregiver(props.familyId, editForm.id, caregiverData)

		// Refresh caregivers list
		await fetchCaregivers()

		emit('caregiver-updated', response)
		closeEditModal()

		// Show success message
		alert('Caregiver updated successfully!')
	} catch (error) {
		console.error('Error updating caregiver:', error)
		alert('Error updating caregiver. Please try again.')
	} finally {
		isUpdating.value = false
	}
}

const removeCaregiver = (caregiver) => {
	if (!canManageFamily.value) {
		alert('You do not have permission to remove caregivers')
		return
	}
	caregiverToRemove.value = caregiver
	removeModal.value?.showModal()
}

const confirmRemove = async () => {
	if (!caregiverToRemove.value) return

	isRemoving.value = true

	try {
		await CaregiversService.removeCaregiver(props.familyId, caregiverToRemove.value.id)

		// Refresh caregivers list
		await fetchCaregivers()

		emit('caregiver-removed', caregiverToRemove.value.id)
		closeRemoveModal()

		// Show success message
		alert('Caregiver removed successfully!')
	} catch (error) {
		console.error('Error removing caregiver:', error)
		alert('Error removing caregiver. Please try again.')
	} finally {
		isRemoving.value = false
	}
}

const resendInvitation = async (caregiver) => {
	if (!canInviteCaregivers.value) {
		alert('You do not have permission to resend invitations')
		return
	}
	
	try {
		await CaregiversService.resendInvitation(props.familyId, caregiver.email)

		// Show success message
		alert('Invitation resent successfully!')
	} catch (error) {
		console.error('Error resending invitation:', error)
		alert('Error resending invitation. Please try again.')
	}
}

const resetInviteForm = () => {
	inviteForm.firstName = ''
	inviteForm.lastName = ''
	inviteForm.email = ''
	inviteForm.phone = ''
	inviteForm.role = 'caregiver'
	inviteForm.message = ''
	inviteErrors.value = {}
}

const closeInviteModal = () => {
	inviteModal.value?.close()
	resetInviteForm()
}

const closeEditModal = () => {
	editModal.value?.close()
}

const closeRemoveModal = () => {
	removeModal.value?.close()
	caregiverToRemove.value = null
}
</script>
