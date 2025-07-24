<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFamilyStore } from '@/stores/family.store';
import authService from '@/services/auth.service';
import AppLayout from '@/components/layout/AppLayout.vue';
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
    
    // Filter out accepted invitations
    const pendingOnly = invitations.filter(inv => !inv.accepted);
    
    pendingInvitations.value = pendingOnly;
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
    // Check if user is already in a family
    if (familyStore.getCurrentFamilyId) {
      invitationsError.value = 'You are already a member of a family. You cannot accept invitations to join another family.';
      return;
    }
    
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
    
    // Check if user is already in a family
    if (familyStore.getCurrentFamilyId) {
      createFamilyError.value = 'You are already a member of a family. You cannot create another family.';
      return;
    }
    
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
    
    // Check if user is already in a family
    if (familyStore.getCurrentFamilyId) {
      joinFamilyError.value = 'You are already a member of a family. You cannot join another family.';
      return;
    }
    
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
  <div class="min-h-screen bg-base-100" data-theme="baby-light">
    <AppLayout>
      <div class="flex-1 p-6">
        <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          <!-- Left side: Invitations -->
          <div class="card shadow-lg border bg-base-100 p-6 flex-1">
            <h2 class="text-2xl font-bold text-base-content mb-4">Family Invitations 👨‍👩‍👧‍👦</h2>
            <div v-if="invitationsError" class="alert alert-error text-sm mb-4">
              {{ invitationsError }}
            </div>
            <div v-if="isLoading" class="flex items-center text-base-content/70 py-4">
              <span class="loading loading-spinner loading-sm mr-2"></span> Loading invitations...
            </div>
            <div v-else>
              <div v-if="pendingInvitations.length === 0" class="text-base-content/70 py-4">
                <p class="text-lg">You don't have any pending invitations.</p>
              </div>
              <div v-else>
                <p class="text-base-content/70 mb-4 text-lg">You have been invited to join the following families:</p>
                <div class="space-y-4">
                  <div 
                    v-for="invitation in pendingInvitations" 
                    :key="invitation.id" 
                    class="card border border-base-300 bg-base-200 p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div class="flex justify-between items-center">
                      <div>
                        <h3 class="font-semibold text-primary text-lg">{{ invitation.family ? invitation.family.name : 'Unknown Family' }}</h3>
                        <p class="text-base-content/70 text-sm">Invited by: {{ invitation.invitedBy ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}` : 'Unknown' }}</p>
                      </div>
                      <button 
                        @click="acceptInvitation(invitation.id)" 
                        class="btn btn-primary btn-sm"
                        :disabled="isLoading"
                      >
                        <span v-if="isLoading" class="loading loading-spinner loading-xs mr-1"></span>
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Right side: Options -->
          <div class="lg:w-96 space-y-6">
            <!-- Create Family -->
            <div class="card shadow-lg border bg-base-100 p-6">
              <h2 class="text-2xl font-bold text-base-content mb-4">Create a Family 🏠</h2>
              <div v-if="createFamilyError" class="alert alert-error text-sm mb-4">
                {{ createFamilyError }}
              </div>
              <p class="text-base-content/70 mb-4 text-lg">Create your family to get started</p>
              <form @submit.prevent="createFamily" class="space-y-4">
                <div class="space-y-2">
                  <label for="familyName" class="font-medium text-base-content">Family Name</label>
                  <input 
                    id="familyName" 
                    v-model="familyName" 
                    type="text" 
                    required 
                    placeholder="Enter your family name"
                    :disabled="isLoading"
                    class="input input-bordered w-full"
                  />
                </div>
                <button 
                  type="submit" 
                  class="btn btn-primary w-full" 
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="loading loading-spinner loading-xs mr-1"></span>
                  {{ isLoading ? 'Creating...' : 'Create Family' }}
                </button>
              </form>
            </div>
            <!-- Join Family with Code -->
            <div class="card shadow-lg border bg-base-100 p-6">
              <h2 class="text-2xl font-bold text-base-content mb-4">Join a Family 🔑</h2>
              <div v-if="joinFamilyError" class="alert alert-error text-sm mb-4">
                {{ joinFamilyError }}
              </div>
              <p class="text-base-content/70 mb-4 text-lg">Enter an invite code to join an existing family</p>
              <form @submit.prevent="joinFamilyWithCode" class="space-y-4">
                <div class="space-y-2">
                  <label for="inviteCode" class="font-medium text-base-content">Invite Code</label>
                  <input 
                    id="inviteCode" 
                    v-model="inviteCode" 
                    type="text" 
                    required 
                    placeholder="Enter invite code"
                    :disabled="isLoading"
                    class="input input-bordered w-full"
                  />
                </div>
                <button 
                  type="submit" 
                  class="btn btn-primary w-full" 
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="loading loading-spinner loading-xs mr-1"></span>
                  {{ isLoading ? 'Joining...' : 'Join Family' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  </div>
</template>
<style scoped>
/* All styling is now handled by Tailwind CSS classes */
</style>
