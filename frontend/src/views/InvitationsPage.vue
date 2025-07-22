<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFamilyStore } from '@/stores/family.store';
import authService from '@/services/auth.service';

const errorMessage = ref('');
const invitationsError = ref('');
const createFamilyError = ref('');
const joinFamilyError = ref('');
const isLoading = ref(false);
const pendingInvitations = ref<any[]>([]);
const familyName = ref('');
const inviteCode = ref('');
const router = useRouter();
const familyStore = useFamilyStore();

// Load pending invitations
const loadInvitations = async () => {
  try {
    isLoading.value = true;
    const invitations = await authService.getPendingInvitations();
    console.log('Received invitations from API:', invitations);

    // Check for the specific invitation mentioned in the issue
    const specificInvitation = invitations.find(inv => inv.id === '89846e99-1e04-46be-ac3f-2974924801ac');
    if (specificInvitation) {
      console.log('Found specific invitation in frontend:', specificInvitation);
    } else {
      console.log('Specific invitation not found in frontend');

      // Log all invitation IDs for debugging
      console.log('All invitation IDs:', invitations.map(inv => inv.id));

      // Check if there are any invitations with email matching patrick.schababerle@icloud.com
      const matchingEmailInvitations = invitations.filter(inv => 
        inv.email && inv.email.toLowerCase() === 'patrick.schababerle@icloud.com'
      );
      console.log('Invitations with matching email:', matchingEmailInvitations);
    }

    // Log the structure of the first invitation if available
    if (invitations.length > 0) {
      console.log('First invitation structure:', JSON.stringify(invitations[0], null, 2));
    }

    pendingInvitations.value = invitations;

    // Log the state after setting pendingInvitations
    console.log('pendingInvitations.value after setting:', pendingInvitations.value);
    console.log('pendingInvitations.value.length:', pendingInvitations.value.length);
  } catch (error) {
    console.error('Failed to load invitations:', error);
    invitationsError.value = 'Failed to load family invitations. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Accept an invitation
const acceptInvitation = async (invitationId: string) => {
  try {
    isLoading.value = true;
    await familyStore.acceptInvitation(invitationId);
    router.push('/app');
  } catch (error) {
    console.error('Failed to accept invitation:', error);
    invitationsError.value = 'Failed to accept invitation. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Create a new family
const createFamily = async () => {
  try {
    // Reset error message
    createFamilyError.value = '';

    // Validate family name
    if (!familyName.value.trim()) {
      createFamilyError.value = 'Please enter a family name';
      return;
    }

    // Set loading state
    isLoading.value = true;

    // Create the family
    await familyStore.createFamily({
      name: familyName.value.trim()
    });

    // Redirect to app page
    router.push('/app');
  } catch (error) {
    console.error('Family creation failed:', error);
    createFamilyError.value = error instanceof Error ? error.message : 'Failed to create family. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Join a family using invite code
const joinFamilyWithCode = async () => {
  try {
    // Reset error message
    joinFamilyError.value = '';

    // Validate invite code
    if (!inviteCode.value.trim()) {
      joinFamilyError.value = 'Please enter an invite code';
      return;
    }

    // Set loading state
    isLoading.value = true;

    // Join the family
    await familyStore.joinFamily(inviteCode.value.trim());

    // Redirect to app page
    router.push('/app');
  } catch (error) {
    console.error('Joining family failed:', error);
    joinFamilyError.value = error instanceof Error ? error.message : 'Failed to join family. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Load invitations when component is mounted
onMounted(() => {
  loadInvitations();
});
</script>

<template>
  <div class="invitations-page">
    <div class="page-container">
      <!-- Left side: Invitations -->
      <div class="card invitations-card">
        <h1>Family Invitations</h1>

        <div v-if="invitationsError" class="error-message">
          {{ invitationsError }}
        </div>

        <div v-if="isLoading" class="loading">
          Loading invitations...
        </div>

        <div v-else>
          <div v-if="pendingInvitations.length === 0" class="no-invitations">
            <p>You don't have any pending invitations.</p>
          </div>

          <div v-else>
            <p class="subtitle">You have been invited to join the following families:</p>

            <div class="invitations-list">
              <div 
                v-for="invitation in pendingInvitations" 
                :key="invitation.id" 
                class="invitation-card"
              >
                <div class="invitation-details">
                  <h3>{{ invitation.family ? invitation.family.name : 'Unknown Family' }}</h3>
                  <p>Invited by: {{ invitation.invitedBy ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}` : 'Unknown' }}</p>
                  <p class="invitation-id">ID: {{ invitation.id }}</p>
                </div>
                <button 
                  @click="acceptInvitation(invitation.id)" 
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Options -->
      <div class="right-column">
        <!-- Create Family -->
        <div class="card create-family-card">
          <h1>Create a Family</h1>

          <div v-if="createFamilyError" class="error-message">
            {{ createFamilyError }}
          </div>

          <p class="subtitle">Create your family to get started</p>

          <form @submit.prevent="createFamily" class="family-form">
            <div class="form-group">
              <label for="familyName">Family Name</label>
              <input 
                id="familyName" 
                v-model="familyName" 
                type="text" 
                required 
                placeholder="Enter your family name"
                :disabled="isLoading"
              />
            </div>

            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="isLoading"
            >
              {{ isLoading ? 'Creating...' : 'Create Family' }}
            </button>
          </form>
        </div>

        <!-- Join Family with Code -->
        <div class="card join-family-card">
          <h1>Join a Family</h1>

          <div v-if="joinFamilyError" class="error-message">
            {{ joinFamilyError }}
          </div>

          <p class="subtitle">Enter an invite code to join an existing family</p>

          <form @submit.prevent="joinFamilyWithCode" class="family-form">
            <div class="form-group">
              <label for="inviteCode">Invite Code</label>
              <input 
                id="inviteCode" 
                v-model="inviteCode" 
                type="text" 
                required 
                placeholder="Enter invite code"
                :disabled="isLoading"
              />
            </div>

            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="isLoading"
            >
              {{ isLoading ? 'Joining...' : 'Join Family' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invitations-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f9fafb;
}

.page-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  width: 100%;
}

.invitations-card {
  max-width: 600px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 500px;
}

.create-family-card,
.join-family-card {
  width: 100%;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
}

.error-message {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #f87171;
  border-radius: 4px;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 2rem 0;
  color: #6b7280;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-outline:hover {
  background-color: #eff6ff;
}

.mt-4 {
  margin-top: 1rem;
}

.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.invitation-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.invitation-details h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.invitation-details p {
  font-size: 0.875rem;
  color: #6b7280;
}

.invitation-id {
  font-size: 0.75rem !important;
  color: #9ca3af !important;
  margin-top: 0.25rem;
}

.no-invitations {
  text-align: center;
  color: #6b7280;
  padding: 2rem 0;
}

/* Form styles */
.family-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #374151;
}

input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsive styles */
@media (max-width: 1024px) {
  .page-container {
    flex-direction: column;
    align-items: center;
  }

  .invitations-card,
  .right-column {
    max-width: 600px;
  }
}
</style>
