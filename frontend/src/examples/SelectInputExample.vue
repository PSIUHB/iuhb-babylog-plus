<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">SelectInput Component Examples</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Basic select with simple options -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Basic Select</h2>
          <SelectInput
            v-model="basicSelect"
            label="Browsers"
            placeholder="Pick a browser"
            :options="browsers"
            optionalText="Optional"
          />
          <p class="text-sm">Selected value: {{ basicSelect || 'None' }}</p>
        </div>
      </div>
      <!-- Select with object options -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Object Options</h2>
          <SelectInput
            v-model="countrySelect"
            label="Country"
            placeholder="Select your country"
            :options="countries"
            required
          />
          <p class="text-sm">Selected value: {{ countrySelect || 'None' }}</p>
        </div>
      </div>
      <!-- Required select with validation -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Required Select with Validation</h2>
          <SelectInput
            v-model="categorySelect"
            label="Category"
            placeholder="Select a category"
            :options="categories"
            :error="categoryError"
            required
          />
          <button class="btn btn-sm mt-2" @click="validateCategory">Validate</button>
        </div>
      </div>
      <!-- Select with help text -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Select with Help Text</h2>
          <SelectInput
            v-model="languageSelect"
            label="Language"
            placeholder="Select your preferred language"
            :options="languages"
            helpText="This will be used for notifications and emails"
          />
        </div>
      </div>
      <!-- Disabled select -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Disabled Select</h2>
          <SelectInput
            v-model="planSelect"
            label="Subscription Plan"
            :options="plans"
            disabled
          />
        </div>
      </div>
      <!-- Select with custom options via slots -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Custom Options via Slots</h2>
          <SelectInput
            v-model="customSelect"
            label="Custom Options"
          >
            <option value="" disabled selected>Select an option</option>
            <option value="option1">Custom Option 1</option>
            <option value="option2">Custom Option 2</option>
            <option value="option3">Custom Option 3</option>
          </SelectInput>
          <p class="text-sm">Selected value: {{ customSelect || 'None' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import SelectInput from '@/components/ui/SelectInput.vue'
// Basic select with simple options
const basicSelect = ref('')
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']
// Select with object options
const countrySelect = ref('')
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' }
]
// Required select with validation
const categorySelect = ref('')
const categoryError = ref('')
const categories = ['Technology', 'Health', 'Education', 'Finance', 'Entertainment']
const validateCategory = () => {
  if (!categorySelect.value) {
    categoryError.value = 'Please select a category'
  } else {
    categoryError.value = ''
    alert(`Category "${categorySelect.value}" is valid!`)
  }
}
// Select with help text
const languageSelect = ref('en')
const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' }
]
// Disabled select
const planSelect = ref('free')
const plans = [
  { value: 'free', label: 'Free Plan' },
  { value: 'basic', label: 'Basic Plan' },
  { value: 'premium', label: 'Premium Plan' },
  { value: 'enterprise', label: 'Enterprise Plan' }
]
// Select with custom options via slots
const customSelect = ref('')
</script>