<template>
  <button
    class="btn btn-sm btn-ghost border-0 ms-auto"
    @click="openHelpModal"
    aria-label="Help"
  >
    <i class="fa-solid fa-question fa-lg p-1"></i>
  </button>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue'
const emit = defineEmits(['open-help-modal'])
const openHelpModal = () => {
  emit('open-help-modal')
}
</script>