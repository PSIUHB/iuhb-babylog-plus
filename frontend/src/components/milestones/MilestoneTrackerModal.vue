<template>
  <dialog ref="milestoneModal" class="modal">
    <div class="modal-box max-w-4xl">
      <!-- Child selection if multiple children -->
      <div v-if="!selectedChild && children.length > 0" class="mb-6">
        <p class="mb-4">Select a child to view and track milestones:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="child in children"
            :key="child.id"
            class="btn btn-outline"
            @click="selectChild(child)"
          >
            {{ child.firstName }} {{ child.lastName }}
          </button>
        </div>
      </div>
      
      <!-- Milestone tracker component -->
      <MilestoneTracker v-if="selectedChild" :child-id="selectedChild.id" :child="selectedChild" />

      <!-- No children message -->
      <div v-if="!selectedChild && children.length === 0" class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>No children found. Please add a child first.</span>
      </div>
      
      <div class="modal-action">
        <button class="btn" @click="closeModal">Close</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="closeModal">close</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MilestoneTracker from '@/components/milestones/MilestoneTracker.vue';
import ChildrenService from '@/services/children.service';
import { useAuthStore } from '@/stores/auth.store';

const milestoneModal = ref(null);
const children = ref([]);
const selectedChild = ref(null);
const loading = ref(false);
const error = ref(null);
const authStore = useAuthStore();

// Fetch children when component is mounted
const fetchChildren = async () => {
  if (!authStore.user?.familyId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await ChildrenService.getChildrenByFamily(authStore.user.familyId);
    children.value = response || [];
    
    // If only one child, select it automatically
    if (children.value.length === 1) {
      selectedChild.value = children.value[0];
    }
  } catch (err) {
    console.error('Error fetching children:', err);
    error.value = 'Failed to load children. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Select a child for milestone viewing
const selectChild = (child) => {
  selectedChild.value = child;
};

// Open the modal
const openModal = (initialChild = null) => {
  if (initialChild) {
    selectedChild.value = initialChild;
  } else {
    fetchChildren();
  }
  milestoneModal.value?.showModal();
};

// Close the modal
const closeModal = () => {
  milestoneModal.value?.close();
  selectedChild.value = null;
};

// Expose methods to parent components
defineExpose({
  openModal,
  closeModal
});
</script>

<style scoped>
.modal-box {
  width: 90%;
  max-width: 800px;
}
</style>