<template>
  <TrackableModal
    ref="modal"
    title="Record Weight"
    @submit="handleSubmit"
    @close="resetForm"
  >
    <form class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Weight Value</span>
        </label>
        <input
          type="number"
          v-model.number="form.value"
          class="input input-bordered w-full"
          step="0.01"
          min="0"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Unit</span>
        </label>
        <select v-model="form.unit" class="select select-bordered w-full">
          <option :value="WeightUnit.KG">Kilograms (kg)</option>
          <option :value="WeightUnit.LB">Pounds (lb)</option>
        </select>
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
import weightsService from '@/services/weights.service';
import { WeightUnit } from '@/interfaces/trackable.interface';

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
  value: 0,
  unit: WeightUnit.KG,
  occurredAt: new Date().toISOString().slice(0, 16),
  notes: ''
};

const form = reactive({ ...defaultForm });
const editMode = ref(false);
const editId = ref(null);

const openModal = (weight = null) => {
  resetForm();
  
  if (weight) {
    // Edit mode
    editMode.value = true;
    editId.value = weight.id;
    
    // Convert date to format expected by datetime-local input
    const occurredAt = new Date(weight.occurredAt);
    const formattedDate = occurredAt.toISOString().slice(0, 16);
    
    Object.assign(form, {
      ...weight,
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
  if (form.value === null || form.value === undefined || form.value <= 0) {
    error.value = 'Please enter a valid weight value';
    return false;
  }
  
  if (!form.unit) {
    error.value = 'Please select a unit';
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
    const weightData = {
      ...form,
      childId: props.childId,
      occurredAt: new Date(form.occurredAt)
    };
    
    let result;
    if (editMode.value && editId.value) {
      // Update existing weight
      result = await weightsService.update(editId.value, weightData);
      emit('updated', result);
    } else {
      // Create new weight
      result = await weightsService.create(weightData);
      emit('created', result);
    }
    
    return true; // Return true to close the modal
  } catch (err) {
    console.error('Error saving weight:', err);
    error.value = 'Failed to save weight. Please try again.';
    return false;
  }
};

defineExpose({
  openModal
});
</script>