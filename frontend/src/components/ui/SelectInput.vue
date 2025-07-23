<template>
  <fieldset class="fieldset">
    <legend v-if="label" class="fieldset-legend">{{ label }}{{ required ? ' *' : '' }}</legend>
    
    <select
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="select select-bordered w-full"
      :class="{ 'select-error': error }"
      :required="required"
      :disabled="disabled"
    >
      <option v-if="placeholder" disabled :selected="!modelValue" :value="''">{{ placeholder }}</option>
      <slot>
        <option 
          v-for="option in options" 
          :key="option.value || option"
          :value="option.value || option"
          :selected="modelValue === (option.value || option)"
        >
          {{ option.label || option }}
        </option>
      </slot>
    </select>
    
    <!-- Optional label -->
    <span v-if="optionalText" class="label">{{ optionalText }}</span>
    
    <!-- Error or help text -->
    <p v-if="error" class="label-text-alt text-error mt-1">{{ error }}</p>
    <p v-else-if="helpText" class="label text-sm">{{ helpText }}</p>
  </fieldset>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  optionalText: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
</script>