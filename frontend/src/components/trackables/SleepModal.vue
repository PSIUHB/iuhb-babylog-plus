<template>
  <TrackableModal
    ref="modal"
    title="Record Sleep"
    @submit="handleSubmit"
    @close="resetForm"
  >
    <form class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Sleep Status</span>
        </label>
        <select v-model="form.status" class="select select-bordered w-full">
          <option :value="SleepStatus.START">Start Sleep</option>
          <option :value="SleepStatus.END">End Sleep</option>
        </select>
      </div>

      <div v-if="form.status === SleepStatus.END" class="form-control">
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

      <div v-if="form.status === SleepStatus.END" class="form-control">
        <label class="label">
          <span class="label-text">Sleep Quality</span>
        </label>
        <select v-model="form.quality" class="select select-bordered w-full">
          <option :value="SleepQuality.POOR">Poor</option>
          <option :value="SleepQuality.FAIR">Fair</option>
          <option :value="SleepQuality.GOOD">Good</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Location</span>
        </label>
        <input
          type="text"
          v-model="form.location"
          class="input input-bordered w-full"
          placeholder="e.g., Crib, Bed, Stroller"
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
import sleepsService from '@/services/sleeps.service';
import { SleepStatus, SleepQuality } from '@/interfaces/trackable.interface';

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
  status: SleepStatus.START,
  duration_minutes: 0,
  quality: SleepQuality.GOOD,
  location: '',
  occurredAt: new Date().toISOString().slice(0, 16),
  notes: ''
};

const form = reactive({ ...defaultForm });
const editMode = ref(false);
const editId = ref(null);

const openModal = (sleep = null, endSleep = false, durationMinutes = 0) => {
  resetForm();
  
  if (sleep) {
    // Edit mode
    editMode.value = true;
    editId.value = sleep.id;
    
    // Convert date to format expected by datetime-local input
    const occurredAt = new Date(sleep.occurredAt);
    const formattedDate = occurredAt.toISOString().slice(0, 16);
    
    Object.assign(form, {
      ...sleep,
      occurredAt: formattedDate
    });
  } else {
    // Create mode
    editMode.value = false;
    editId.value = null;
    
    // If endSleep is true, preselect "End sleep" and prefill duration
    if (endSleep) {
      form.status = SleepStatus.END;
      form.duration_minutes = durationMinutes;
    }
  }
  
  modal.value.openModal();
};

const resetForm = () => {
  Object.assign(form, defaultForm);
  error.value = '';
};

const validateForm = () => {
  if (!form.status) {
    error.value = 'Please select a sleep status';
    return false;
  }
  
  if (form.status === SleepStatus.END && !form.duration_minutes) {
    error.value = 'Please enter a duration';
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
    const sleepData = {
      ...form,
      childId: props.childId,
      occurredAt: new Date(form.occurredAt)
    };
    
    let result;
    if (editMode.value && editId.value) {
      // Update existing sleep
      result = await sleepsService.update(editId.value, sleepData);
      emit('updated', result);
    } else {
      // Create new sleep
      result = await sleepsService.create(sleepData);
      emit('created', result);
    }
    
    return true; // Return true to close the modal
  } catch (err) {
    console.error('Error saving sleep:', err);
    error.value = 'Failed to save sleep. Please try again.';
    return false;
  }
};

defineExpose({
  openModal
});
</script>