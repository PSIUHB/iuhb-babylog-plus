<template>
  <TrackableModal
    ref="modal"
    title="Record Feeding"
    @submit="handleSubmit"
    @close="resetForm"
  >
    <form class="space-y-4">
      <SelectInput
        v-model="form.method"
        label="Feeding Method"
        :options="feedingMethodOptions"
      />
      <SelectInput
        v-if="form.method === FeedingMethod.BREAST"
        v-model="form.side"
        label="Side"
        :options="breastSideOptions"
      />
      <div v-if="form.method === FeedingMethod.BOTTLE">
        <TextInput
          v-model.number="form.amount_ml"
          type="number"
          label="Amount (ml)"
          min="0"
        />
      </div>
      <div v-if="form.method === FeedingMethod.SOLID">
        <TextInput
          v-model="form.food_type"
          label="Food Type"
          placeholder="e.g., Puree, Cereal, Fruit"
        />
      </div>
      <TextInput
        v-model.number="form.duration_minutes"
        type="number"
        label="Duration (minutes)"
        min="0"
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
import feedsService from '@/services/feeds.service';
import { FeedingMethod, BreastSide } from '@/interfaces/trackable.interface';
import { formatDateTime } from '@/utils/timeUtils';
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
const feedingMethodOptions = [
  { value: FeedingMethod.BREAST, label: 'Breast' },
  { value: FeedingMethod.BOTTLE, label: 'Bottle' },
  { value: FeedingMethod.SOLID, label: 'Solid Food' }
];
const breastSideOptions = [
  { value: BreastSide.LEFT, label: 'Left' },
  { value: BreastSide.RIGHT, label: 'Right' },
  { value: BreastSide.BOTH, label: 'Both' }
];
const defaultForm = {
  childId: props.childId,
  method: FeedingMethod.BREAST,
  side: BreastSide.LEFT,
  amount_ml: 0,
  duration_minutes: 0,
  food_type: '',
  occurredAt: formatDateTime(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
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
    // Convert UTC date to local datetime-local format
    const occurredAt = new Date(feed.occurredAt);
    const formattedDate = formatDateTime(occurredAt, 'yyyy-MM-dd\'T\'HH:mm');
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
  // Update defaultForm with current local time
  const updatedDefaultForm = {
    ...defaultForm,
    occurredAt: formatDateTime(new Date(), 'yyyy-MM-dd\'T\'HH:mm')
  };
  Object.assign(form, updatedDefaultForm);
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