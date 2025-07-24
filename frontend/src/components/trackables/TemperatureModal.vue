<template>
  <TrackableModal
    ref="modal"
    title="Record Temperature"
    @submit="handleSubmit"
    @close="resetForm"
  >
    <form class="space-y-4">
      <TextInput
        v-model.number="form.value"
        type="number"
        label="Temperature Value"
        step="0.1"
        min="30"
        max="45"
      />
      <SelectInput
        v-model="form.unit"
        label="Unit"
        :options="temperatureUnitOptions"
      />
      <SelectInput
        v-model="form.location"
        label="Measurement Location"
        :options="temperatureLocationOptions"
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
import temperaturesService from '@/services/temperatures.service';
import { TemperatureUnit, TemperatureLocation } from '@/interfaces/trackable.interface';
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
const temperatureUnitOptions = [
  { value: TemperatureUnit.CELSIUS, label: 'Celsius (°C)' },
  { value: TemperatureUnit.FAHRENHEIT, label: 'Fahrenheit (°F)' }
];
const temperatureLocationOptions = [
  { value: TemperatureLocation.ORAL, label: 'Oral' },
  { value: TemperatureLocation.RECTAL, label: 'Rectal' },
  { value: TemperatureLocation.ARMPIT, label: 'Armpit' },
  { value: TemperatureLocation.EAR, label: 'Ear' },
  { value: TemperatureLocation.FOREHEAD, label: 'Forehead' }
];
const defaultForm = {
  childId: props.childId,
  value: 37.0,
  unit: TemperatureUnit.CELSIUS,
  location: TemperatureLocation.ARMPIT,
  occurredAt: new Date().toISOString().slice(0, 16),
  notes: ''
};
const form = reactive({ ...defaultForm });
const editMode = ref(false);
const editId = ref(null);
const openModal = (temperature = null) => {
  resetForm();
  if (temperature) {
    // Edit mode
    editMode.value = true;
    editId.value = temperature.id;
    // Convert date to format expected by datetime-local input
    const occurredAt = new Date(temperature.occurredAt);
    const formattedDate = occurredAt.toISOString().slice(0, 16);
    Object.assign(form, {
      ...temperature,
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
  if (form.value === null || form.value === undefined) {
    error.value = 'Please enter a temperature value';
    return false;
  }
  if (!form.unit) {
    error.value = 'Please select a unit';
    return false;
  }
  if (!form.location) {
    error.value = 'Please select a measurement location';
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
    const temperatureData = {
      ...form,
      childId: props.childId,
      occurredAt: new Date(form.occurredAt)
    };
    let result;
    if (editMode.value && editId.value) {
      // Update existing temperature
      result = await temperaturesService.update(editId.value, temperatureData);
      emit('updated', result);
    } else {
      // Create new temperature
      result = await temperaturesService.create(temperatureData);
      emit('created', result);
    }
    return true; // Return true to close the modal
  } catch (err) {
    console.error('Error saving temperature:', err);
    error.value = 'Failed to save temperature. Please try again.';
    return false;
  }
};
defineExpose({
  openModal
});
</script>