<template>
  <TrackableModal
    ref="modal"
    title="Record Diaper Change"
    @submit="handleSubmit"
    @close="resetForm"
  >
    <form class="space-y-4">
      <SelectInput
        v-model="form.type"
        label="Diaper Type"
        :options="diaperTypeOptions"
      />
      <div v-if="form.type !== DiaperType.WET">
        <TextInput
          v-model="form.consistency"
          label="Consistency"
          placeholder="e.g., Soft, Hard, Runny"
        />
      </div>
      <div v-if="form.type !== DiaperType.WET">
        <TextInput
          v-model="form.color"
          label="Color"
          placeholder="e.g., Yellow, Green, Brown"
        />
      </div>
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
import diapersService from '@/services/diapers.service';
import { DiaperType } from '@/interfaces/trackable.interface';
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
const diaperTypeOptions = [
  { value: DiaperType.WET, label: 'Wet' },
  { value: DiaperType.DIRTY, label: 'Dirty' },
  { value: DiaperType.BOTH, label: 'Both' }
];
const defaultForm = {
  childId: props.childId,
  type: DiaperType.WET,
  consistency: '',
  color: '',
  occurredAt: new Date().toISOString().slice(0, 16),
  notes: ''
};
const form = reactive({ ...defaultForm });
const editMode = ref(false);
const editId = ref(null);
const openModal = (diaper = null) => {
  resetForm();
  if (diaper) {
    // Edit mode
    editMode.value = true;
    editId.value = diaper.id;
    // Convert date to format expected by datetime-local input
    const occurredAt = new Date(diaper.occurredAt);
    const formattedDate = occurredAt.toISOString().slice(0, 16);
    Object.assign(form, {
      ...diaper,
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
  if (!form.type) {
    error.value = 'Please select a diaper type';
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
    const diaperData = {
      ...form,
      childId: props.childId,
      occurredAt: new Date(form.occurredAt)
    };
    let result;
    if (editMode.value && editId.value) {
      // Update existing diaper
      result = await diapersService.update(editId.value, diaperData);
      emit('updated', result);
    } else {
      // Create new diaper
      result = await diapersService.create(diaperData);
      emit('created', result);
    }
    return true; // Return true to close the modal
  } catch (err) {
    console.error('Error saving diaper:', err);
    error.value = 'Failed to save diaper. Please try again.';
    return false;
  }
};
defineExpose({
  openModal
});
</script>