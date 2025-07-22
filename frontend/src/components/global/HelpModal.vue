<template>
  <!-- Help Modal -->
  <dialog ref="helpModal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">{{ title }}</h3>
      
      <div class="space-y-4">
        <slot></slot>
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
import { ref, defineProps, defineExpose } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

const helpModal = ref(null)

// Modal functions
const openModal = () => {
  helpModal.value?.showModal()
}

const closeModal = () => {
  helpModal.value?.close()
}

// Expose methods to parent components
defineExpose({
  openModal,
  closeModal
})
</script>