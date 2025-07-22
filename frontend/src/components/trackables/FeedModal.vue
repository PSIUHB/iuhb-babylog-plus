<template>
  <TrackableModal
    ref="modal"
    title="Record Feeding"
    @submit="handleSubmit"
    @close="resetForm"
  >
    <form class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Feeding Method</span>
        </label>
        <select v-model="form.method" class="select select-bordered w-full">
          <option :value="FeedingMethod.BREAST">Breast</option>
          <option :value="FeedingMethod.BOTTLE">Bottle</option>
          <option :value="FeedingMethod.SOLID">Solid Food</option>
        </select>
      </div>

      <div v-if="form.method === FeedingMethod.BREAST" class="form-control">
        <label class="label">
          <span class="label-text">Side</span>
        </label>
        <select v-model="form.side" class="select select-bordered w-full">
          <option :value="BreastSide.LEFT">Left</option>
          <option :value="BreastSide.RIGHT">Right</option>
          <option :value="BreastSide.BOTH">Both</option>
        </select>
      </div>

      <div v-if="form.method === FeedingMethod.BOTTLE" class="form-control">
        <label class="label">
          <span class="label-text">Amount (ml)</span>
        </label>
        <input
          type="number"
          v-model.number="form.amount_ml"
          class="input input-bordered w-full"
          min="0"
        />
      </div>

      <div v-if="form.method === FeedingMethod.SOLID" class="form-control">
        <label class="label">
          <span class="label-text">Food Type</span>
        </label>
        <input
          type="text"
          v-model="form.food_type"
          class="input input-bordered w-full"
          placeholder="e.g., Puree, Cereal, Fruit"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Duration (minutes)</span>
        </label>
        <input
          type="number"
          v-model.number="form.duration_minutes"
          class="input input-bordered w-full"
          min="0"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Date & Time</span>
        </label>
        <input
          type="datetime-local"
          v-model="form.occurredAt"
          class="input input-bordered w-full"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Notes</span>
        </label>
        <textarea
          v-model="form.notes"
          class="textarea textarea-bordered h-24"
          placeholder="Add any additional notes here..."
        ></textarea>
      </div>
    </form>

    <div v-if="error" class="alert alert-error mt-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{{ error }}</span>
    </div>
  </TrackableModal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import TrackableModal from './TrackableModal.vue';
import feedsService from '@/services/feeds.service';
import { FeedingMethod, BreastSide } from '@/interfaces/trackable.interface';

const props = defineProps({
  childId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['created', 'updated']);

const modal = ref(null);
const error = ref('');

const defaultForm = {
  childId: props.childId,
  method: FeedingMethod.BREAST,
  side: BreastSide.LEFT,
  amount_ml: 0,
  duration_minutes: 0,
  food_type: '',
  occurredAt: new Date().toISOString().slice(0, 16),
  notes: ''
};

const form = reactive({ ...defaultForm });
const editMode = ref(false);
const editId = ref(null);

const openModal = (feed = null) => {
  resetForm();
  
  if (feed) {
    // Edit mode
    editMode.value = true;
    editId.value = feed.id;
    
    // Convert date to format expected by datetime-local input
    const occurredAt = new Date(feed.occurredAt);
    const formattedDate = occurredAt.toISOString().slice(0, 16);
    
    Object.assign(form, {
      ...feed,
      occurredAt: formattedDate
    });
  } else {
    // Create mode
    editMode.value = false;
    editId.value = null;
  }
  
  modal.value.openModal();
};

const resetForm = () => {
  Object.assign(form, defaultForm);
  error.value = '';
};

const validateForm = () => {
  if (!form.method) {
    error.value = 'Please select a feeding method';
    return false;
  }
  
  if (form.method === FeedingMethod.BREAST && !form.side) {
    error.value = 'Please select a breast side';
    return false;
  }
  
  if (form.method === FeedingMethod.BOTTLE && !form.amount_ml) {
    error.value = 'Please enter an amount';
    return false;
  }
  
  if (form.method === FeedingMethod.SOLID && !form.food_type) {
    error.value = 'Please enter a food type';
    return false;
  }
  
  if (!form.occurredAt) {
    error.value = 'Please select a date and time';
    return false;
  }
  
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    // Convert form data to proper format
    const feedData = {
      ...form,
      childId: props.childId,
      occurredAt: new Date(form.occurredAt)
    };
    
    let result;
    if (editMode.value && editId.value) {
      // Update existing feed
      result = await feedsService.update(editId.value, feedData);
      emit('updated', result);
    } else {
      // Create new feed
      result = await feedsService.create(feedData);
      emit('created', result);
    }
    
    return true; // Return true to close the modal
  } catch (err) {
    console.error('Error saving feed:', err);
    error.value = 'Failed to save feed. Please try again.';
    return false;
  }
};

defineExpose({
  openModal
});
</script>