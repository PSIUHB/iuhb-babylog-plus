<template>
  <dialog ref="modal" class="modal">
    <div class="modal-box w-11/12 max-w-2xl">
      <h3 class="font-bold text-lg mb-4">{{ title }}</h3>
      
      <slot></slot>
      
      <div class="modal-action">
        <button 
          type="button" 
          class="btn btn-primary" 
          :disabled="saving" 
          @click="handleSubmit"
        >
          <span v-if="saving" class="loading loading-spinner loading-xs mr-2"></span>
          Save
        </button>
        <button 
          type="button" 
          class="btn" 
          :disabled="saving" 
          @click="closeModal"
        >
          Cancel
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="closeModal">close</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['submit', 'close']);

const modal = ref(null);
const saving = ref(false);

const openModal = () => {
  if (modal.value) {
    modal.value.showModal();
  }
};

const closeModal = () => {
  if (modal.value) {
    modal.value.close();
    emit('close');
  }
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    await emit('submit');
    closeModal();
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    saving.value = false;
  }
};

defineExpose({
  openModal,
  closeModal
});
</script>