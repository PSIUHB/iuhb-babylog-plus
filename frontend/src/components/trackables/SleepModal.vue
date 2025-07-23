<template>
  <TrackableModal
    ref="modal"
    title="Record Sleep"
    @submit="handleSubmit"
    @close="resetForm"
  >
    <form class="space-y-4">
      <SelectInput
        v-model="form.status"
        label="Sleep Status"
        :options="sleepStatusOptions"
      />

      <div v-if="form.status === SleepStatus.END">
        <TextInput
          v-model.number="form.duration_minutes"
          type="number"
          label="Duration (minutes)"
          min="0"
        />
      </div>

      <SelectInput
        v-if="form.status === SleepStatus.END"
        v-model="form.quality"
        label="Sleep Quality"
        :options="sleepQualityOptions"
      />

      <TextInput
        v-model="form.location"
        label="Location"
        placeholder="e.g., Crib, Bed, Stroller"
      />

      <TextInput
        v-model="form.occurredAt"
        type="datetime-local"
        label="Date & Time"
      />

      <TextInput
        v-model="form.notes"
        type="textarea"
        label="Notes"
        placeholder="Add any additional notes here..."
        :rows="4"
      />
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
import TextInput from '@/components/ui/TextInput.vue';
import SelectInput from '@/components/ui/SelectInput.vue';
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

// Options for select inputs
const sleepStatusOptions = [
  { value: SleepStatus.START, label: 'Start Sleep' },
  { value: SleepStatus.END, label: 'End Sleep' }
];

const sleepQualityOptions = [
  { value: SleepQuality.POOR, label: 'Poor' },
  { value: SleepQuality.FAIR, label: 'Fair' },
  { value: SleepQuality.GOOD, label: 'Good' }
];

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