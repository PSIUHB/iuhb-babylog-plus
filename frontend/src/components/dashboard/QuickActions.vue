<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h3 class="card-title mb-4">Quick Actions</h3>
			<div class="grid grid-cols-2 gap-3">
				<button
					v-for="action in actions"
					:key="action.id"
					class="btn btn-outline btn-sm hover:btn-primary transition-colors duration-200"
					@click="handleAction(action)"
					:disabled="action.disabled"
				>
					{{ action.icon }} {{ action.label }}
				</button>
			</div>

			<!-- Baby Selection Modal (when multiple babies) -->
			<dialog
				ref="babySelectionModal"
				class="modal"
				v-if="showBabySelection"
			>
				<div class="modal-box">
					<h3 class="font-bold text-lg mb-4">Select Baby</h3>
					<p class="mb-4">Which baby is this for?</p>

					<div class="space-y-3">
						<button
							v-for="baby in babies"
							:key="baby.id"
							class="btn btn-block justify-start"
							:class="baby.colorTheme === 'primary' ? 'btn-primary' : 'btn-secondary'"
							@click="selectBaby(baby)"
						>
							<div
								class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3"
								:class="baby.colorTheme === 'primary' ? 'bg-primary' : 'bg-secondary'"
							>
								{{ baby.initial }}
							</div>
							{{ baby.name }}
						</button>
					</div>

					<div class="modal-action">
						<button class="btn btn-ghost" @click="closeBabySelection">Cancel</button>
					</div>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button @click="closeBabySelection">close</button>
				</form>
			</dialog>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

// Emits for parent component communication
const emit = defineEmits(['action-selected'])

// Reactive data
const babySelectionModal = ref(null)
const showBabySelection = ref(false)
const selectedAction = ref(null)

const actions = ref([
	{
		id: 1,
		icon: '🚼',
		label: 'Diaper',
		action: 'diaper',
		disabled: false,
		requiresBabySelection: true
	},
	{
		id: 2,
		icon: '🌡️',
		label: 'Temperature',
		action: 'temperature',
		disabled: false,
		requiresBabySelection: true
	},
	{
		id: 3,
		icon: '💊',
		label: 'Medicine',
		action: 'medicine',
		disabled: false,
		requiresBabySelection: true
	},
	{
		id: 4,
		icon: '⚖️',
		label: 'Weight',
		action: 'weight',
		disabled: false,
		requiresBabySelection: true
	},
	{
		id: 5,
		icon: '🛁',
		label: 'Bath',
		action: 'bath',
		disabled: false,
		requiresBabySelection: true
	},
	{
		id: 6,
		icon: '🎵',
		label: 'Tummy Time',
		action: 'tummy-time',
		disabled: false,
		requiresBabySelection: true
	},
	{
		id: 7,
		icon: '🏆',
		label: 'Milestones',
		action: 'milestones',
		disabled: false,
		requiresBabySelection: false
	}
])

const babies = ref([
	{
		id: 1,
		name: 'Anna Marie',
		initial: 'A',
		colorTheme: 'primary'
	},
	{
		id: 2,
		name: 'Ben Thomas',
		initial: 'B',
		colorTheme: 'secondary'
	}
])

// Methods
const handleAction = (action) => {
	selectedAction.value = action

	if (action.requiresBabySelection && babies.value.length > 1) {
		showBabySelection.value = true
		babySelectionModal.value?.showModal()
	} else {
		// If only one baby or action doesn't require selection
		const baby = babies.value.length === 1 ? babies.value[0] : null
		executeAction(action, baby)
	}
}

const selectBaby = (baby) => {
	executeAction(selectedAction.value, baby)
	closeBabySelection()
}

const executeAction = (action, baby) => {
	console.log(`Quick action: ${action.action} for ${baby?.name || 'unknown baby'}`)

	// Emit event to parent component
	emit('action-selected', {
		action: action.action,
		baby: baby,
		timestamp: new Date()
	})

	// Here you would typically:
	// 1. Call an API service
	// 2. Update a store
	// 3. Navigate to a specific form
	// 4. Show a success message
}

const closeBabySelection = () => {
	showBabySelection.value = false
	selectedAction.value = null
	babySelectionModal.value?.close()
}
</script>

<style scoped>
.btn:hover {
	transform: translateY(-1px);
}

.btn:active {
	transform: translateY(0);
}
</style>