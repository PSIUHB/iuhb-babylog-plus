<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFamilyStore } from '@/stores/family.store';
import authService from '@/services/auth.service';

const familyName = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const showInvitations = ref(false);
const pendingInvitations = ref<any[]>([]);
const router = useRouter();
const familyStore = useFamilyStore();

// Load pending invitations
const loadInvitations = async () => {
  try {
    isLoading.value = true;
    pendingInvitations.value = await authService.getPendingInvitations();

	console.log(pendingInvitations);

    showInvitations.value = pendingInvitations.value.length > 0;
  } catch (error) {
    console.error('Failed to load invitations:', error);
    errorMessage.value = 'Failed to load family invitations. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Call loadInvitations when component is mounted
loadInvitations();

// Create a new family
const createFamily = async () => {
  try {
    // Reset error message
    errorMessage.value = '';
    
    // Validate family name
    if (!familyName.value.trim()) {
      errorMessage.value = 'Please enter a family name';
      return;
    }
    
    // Set loading state
    isLoading.value = true;
    
    // Create the family
    const response = await familyStore.createFamily({
      name: familyName.value.trim()
    });
    
    // Redirect to app page
    router.push('/app');
  } catch (error) {
    console.error('Family creation failed:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to create family. Please try again.';
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
    errorMessage.value = 'Failed to accept invitation. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Toggle between create family and view invitations
const toggleView = () => {
  showInvitations.value = !showInvitations.value;
};
</script>

<template>
  <div class="create-family-page">
    <div class="card">
      <h1>Welcome to BabyLogPlus</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="!showInvitations">
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
        
        <div v-if="pendingInvitations.length > 0" class="toggle-view">
          <button @click="toggleView" class="btn btn-text">
            Or join an existing family
          </button>
        </div>
      </div>
      
      <div v-else>
        <p class="subtitle">Join an existing family</p>
        
        <div v-if="pendingInvitations.length === 0" class="no-invitations">
          <p>You don't have any pending invitations.</p>
        </div>
        
        <div v-else class="invitations-list">
          <div 
            v-for="invitation in pendingInvitations" 
            :key="invitation.id" 
            class="invitation-card"
          >
            <div class="invitation-details">
              <h3>{{ invitation.family.name }}</h3>
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
        
        <div class="toggle-view">
          <button @click="toggleView" class="btn btn-text">
            Or create a new family
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-family-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f9fafb;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
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

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  padding: 0.5rem;
}

.btn-text:hover {
  text-decoration: underline;
}

.toggle-view {
  margin-top: 2rem;
  text-align: center;
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

.no-invitations {
  text-align: center;
  color: #6b7280;
  padding: 2rem 0;
}
</style>