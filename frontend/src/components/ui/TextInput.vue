<template>
	<fieldset class="fieldset">
		<legend v-if="label" class="fieldset-legend">{{ label }}{{ required ? ' *' : '' }}</legend>
		<!-- Regular input -->
		<input
			v-if="type !== 'textarea'"
			:type="type"
			:value="modelValue"
			@input="$emit('update:modelValue', $event.target.value)"
			:placeholder="placeholder"
			class="input input-bordered w-full"
			:class="{ 'input-error': error }"
			:required="required"
			:maxlength="maxlength"
			:disabled="disabled"
			:readonly="readonly"
		/>
		<!-- Textarea input -->
		<textarea
			v-else
			:value="modelValue"
			@input="$emit('update:modelValue', $event.target.value)"
			:placeholder="placeholder"
			class="textarea textarea-bordered w-full"
			:class="{ 'textarea-error': error }"
			:required="required"
			:maxlength="maxlength"
			:disabled="disabled"
			:rows="rows"
		></textarea>
		<!-- Error or help text -->
		<p v-if="error" class="label-text-alt text-error mt-1">{{ error }}</p>
		<p v-else-if="helpText" class="label text-sm">{{ helpText }}</p>
		<!-- Character count for textarea or text inputs with maxlength -->
		<p v-if="showCharCount && maxlength" class="label-text-alt text-sm mt-1">
			{{ modelValue?.length || 0 }}/{{ maxlength }} characters
		</p>
	</fieldset>
</template>
<script setup>
defineProps({
	modelValue: {
		type: [String, Number],
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
	type: {
		type: String,
		default: 'text'
	},
	error: {
		type: String,
		default: ''
	},
	helpText: {
		type: String,
		default: ''
	},
	required: {
		type: Boolean,
		default: false
	},
	readonly: {
		type: Boolean,
		default: false
	},
	disabled: {
		type: Boolean,
		default: false
	},
	maxlength: {
		type: [String, Number],
		default: null
	},
	disabled: {
		type: Boolean,
		default: false
	},
	rows: {
		type: [String, Number],
		default: 3
	},
	showCharCount: {
		type: Boolean,
		default: false
	}
});
defineEmits(['update:modelValue']);
</script>