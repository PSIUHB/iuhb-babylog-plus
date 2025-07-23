<template>
  <div class="milestone-tracker">
    <div class="mb-4">
      <h2 class="text-xl font-bold">Developmental Milestones</h2>
      <p class="text-sm text-base-content/70">
        Track your child's developmental milestones and celebrate their progress.
      </p>
    </div>

    <!-- Category selector -->
    <div class="tabs tabs-boxed mb-4">
      <a 
        v-for="category in categories" 
        :key="category.value"
        :class="['tab', selectedCategory === category.value ? 'tab-active' : '']"
        @click="selectedCategory = category.value"
      >
        {{ category.label }}
      </a>
    </div>

    <!-- Milestone list -->
    <div v-if="loading" class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      <div class="flex-1">
        <label>{{ error }}</label>
      </div>
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="milestone in filteredMilestones" :key="milestone.milestone" class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold">{{ milestone.milestone }}</h3>
              <p class="text-sm text-base-content/70">
                Expected: {{ milestone.expectedAgeMonths }} months 
                ({{ milestone.ageRangeMonths[0] }}-{{ milestone.ageRangeMonths[1] }} months)
              </p>
		      <ScalaComponent
				:range-start="milestone.ageRangeMonths[0]"
				:range-end="milestone.ageRangeMonths[1]"
				:range-offset="2"
				:target="milestone.expectedAgeMonths"
				:current="getMilestoneCurrentAge(milestone)"
			  />
              <div v-if="milestone.achieved" class="mt-2 badge badge-success gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Achieved on {{ formatDate(milestone.achievedDate) }}
              </div>
            </div>
            
            <div>
              <button 
                v-if="!milestone.achieved"
                class="btn btn-sm btn-primary"
                @click="openMilestoneModal(milestone)"
              >
                Record
              </button>
              <div v-else class="flex gap-2">
                <button
                  class="btn btn-sm btn-ghost"
                  @click="openMilestoneModal(milestone)"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Milestone modal -->
    <dialog id="milestone_modal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Record Milestone</h3>
        
        <form @submit.prevent="saveMilestone">
          <TextInput
            v-model="selectedMilestone.milestone"
            label="Milestone"
            disabled
            class="mb-4"
          />
          
          <TextInput
            v-model="achievedDate"
            type="date"
            label="Date Achieved"
            required
            :max="today"
            class="mb-4"
          />
          
          <TextInput
            v-model="notes"
            type="textarea"
            label="Notes (optional)"
            placeholder="Add any notes about this milestone"
            class="mb-6"
          />
          
          <div class="modal-action">
            <button type="button" class="btn" @click="closeMilestoneModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-xs"></span>
              Save
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import milestoneService from '@/services/milestones.service';
import { MilestoneCategory } from '@/interfaces/milestone.interface';
import type { Child } from '@/interfaces/child.interface';
import { format, differenceInMonths } from 'date-fns';
import ScalaComponent from "@/components/statistics/ScalaComponent.vue";
import TextInput from '@/components/ui/TextInput.vue';

const props = defineProps({
  childId: {
    type: String,
    required: true
  },
  child: {
    type: Object as () => Child,
    required: false
  }
});

// State
const milestones = ref<Record<MilestoneCategory, any[]>>({
  [MilestoneCategory.MOTOR_DEVELOPMENT]: [],
  [MilestoneCategory.COMMUNICATION_LANGUAGE]: [],
  [MilestoneCategory.COGNITIVE_DEVELOPMENT]: [],
  [MilestoneCategory.SOCIAL_EMOTIONAL]: [],
  [MilestoneCategory.SELF_CARE]: [],
  [MilestoneCategory.PHYSICAL_GROWTH]: []
});
const loading = ref(false);
const error = ref<string | null>(null);
const selectedCategory = ref<MilestoneCategory>(MilestoneCategory.MOTOR_DEVELOPMENT);
const selectedMilestone = ref<any>({});
const achievedDate = ref('');
const notes = ref('');
const saving = ref(false);

// Computed
const categories = computed(() => [
  { label: 'Motor', value: MilestoneCategory.MOTOR_DEVELOPMENT },
  { label: 'Communication', value: MilestoneCategory.COMMUNICATION_LANGUAGE },
  { label: 'Cognitive', value: MilestoneCategory.COGNITIVE_DEVELOPMENT },
  { label: 'Social', value: MilestoneCategory.SOCIAL_EMOTIONAL },
  { label: 'Self-Care', value: MilestoneCategory.SELF_CARE },
  { label: 'Physical', value: MilestoneCategory.PHYSICAL_GROWTH }
]);

const currentChildAgeInMonths = computed(() => {
  if (!props.child?.birthDate) {
    return 0;
  }

  const birthDate = new Date(props.child.birthDate);
  const today = new Date();
  const ageInMonths = differenceInMonths(today, birthDate);

  return Math.max(0, ageInMonths);
});

const getMilestoneCurrentAge = (milestone: any) => {
  if (!props.child?.birthDate) {
    return 0;
  }

  // Falls Meilenstein erreicht wurde, berechne das Alter zum Zeitpunkt der Erreichung
  if (milestone.achieved && milestone.achievedDate) {
    const birthDate = new Date(props.child.birthDate);
    const achievedDate = new Date(milestone.achievedDate);
    const ageAtAchievement = differenceInMonths(achievedDate, birthDate);
    return Math.max(0, ageAtAchievement);
  }

  // Falls Meilenstein nicht erreicht, verwende das aktuelle Alter des Kindes
  return currentChildAgeInMonths.value;
};

const filteredMilestones = computed(() => {
  if (!milestones.value || !milestones.value[selectedCategory.value]) {
    return [];
  }
  
  // Filter out milestones with undefined data before sorting
  const validMilestones = milestones.value[selectedCategory.value].filter(
    milestone => milestone && typeof milestone.expectedAgeMonths === 'number'
  );
  
  // Sort milestones by expectedAgeMonths to ensure they're displayed in chronological order
  return [...validMilestones].sort((a, b) => a.expectedAgeMonths - b.expectedAgeMonths) || [];
});

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Methods
const fetchMilestones = async () => {
  if (!props.childId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Fetching milestones for child:', props.childId);
    const data = await milestoneService.getChildMilestones(props.childId);
    console.log('Received milestone data:', data);

    // Check if data is undefined or null
    if (data === undefined || data === null) {
      console.error('API returned undefined/null milestone data');
      error.value = 'Received undefined milestone data. Please try again.';
      initializeEmptyMilestones();
      return;
    }
    
    // Check if data is valid and has the expected structure
    if (typeof data === 'object') {
      // Log the actual keys in the response for debugging
      console.log('Response keys:', Object.keys(data));
      console.log('Expected categories:', Object.values(MilestoneCategory));

      // The API response is valid, assign it directly
      milestones.value = data;
      console.log('Successfully loaded milestones');
    } else {
      console.error('Invalid milestone data type:', typeof data, data);
      error.value = 'Received invalid milestone data format.';
      initializeEmptyMilestones();
    }
  } catch (err: any) {
    console.error('Error fetching milestones:', err);

    // Check if it's a network error or API error
    if (err?.response?.status === 404) {
      error.value = 'Child not found or you do not have access to this child.';
    } else if (err?.response?.status >= 500) {
      error.value = 'Server error. Please try again later.';
    } else if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('network')) {
      error.value = 'Network error. Please check your connection.';
    } else {
      error.value = 'Failed to load milestones. Please try again.';
    }

    initializeEmptyMilestones();
  } finally {
    loading.value = false;
  }
};

// Helper function to initialize empty milestone arrays
const initializeEmptyMilestones = () => {
  milestones.value = {
    [MilestoneCategory.MOTOR_DEVELOPMENT]: [],
    [MilestoneCategory.COMMUNICATION_LANGUAGE]: [],
    [MilestoneCategory.COGNITIVE_DEVELOPMENT]: [],
    [MilestoneCategory.SOCIAL_EMOTIONAL]: [],
    [MilestoneCategory.SELF_CARE]: [],
    [MilestoneCategory.PHYSICAL_GROWTH]: []
  };
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM d, yyyy');
};

const openMilestoneModal = (milestone: any) => {
  selectedMilestone.value = milestone;
  achievedDate.value = milestone.achievedDate ? new Date(milestone.achievedDate).toISOString().split('T')[0] : today.value;
  notes.value = '';
  
  const modal = document.getElementById('milestone_modal') as HTMLDialogElement;
  if (modal) modal.showModal();
};

const closeMilestoneModal = () => {
  const modal = document.getElementById('milestone_modal') as HTMLDialogElement;
  if (modal) modal.close();
};

const saveMilestone = async () => {
  saving.value = true;
  
  try {
    await milestoneService.createMilestoneEvent({
      childId: props.childId,
      category: selectedMilestone.value.category,
      milestone: selectedMilestone.value.milestone,
      expectedAgeMonths: selectedMilestone.value.expectedAgeMonths,
      ageRangeMonths: selectedMilestone.value.ageRangeMonths,
      achievedDate: new Date(achievedDate.value).toISOString(),
      notes: notes.value
    });
    
    // Refresh milestones
    await fetchMilestones();
    closeMilestoneModal();
  } catch (err: any) {
    console.error('Error saving milestone:', err);
    error.value = 'Failed to save milestone. Please try again.';
  } finally {
    saving.value = false;
  }
};


// Lifecycle
onMounted(() => {
  fetchMilestones();
});

watch(() => props.childId, (newChildId) => {
  if (newChildId) {
    fetchMilestones();
  }
});
</script>

<style scoped>
.milestone-tracker {
  max-width: 100%;
}
</style>