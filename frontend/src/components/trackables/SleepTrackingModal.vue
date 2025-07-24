<template>
	<TrackableModal
		ref="modal"
		title="Track Sleep"
		@submit="handleSubmit"
		@close="resetForm"
		:showSubmit="false"
	>
		<!-- Unified Sleep Tracking Form -->
		<form class="space-y-4">
			<!-- Control Button (Start/End Sleep) -->
			<div class="flex justify-center mb-4">
				<button
					type="button"
					:class="childIsSleeping ? 'btn btn-accent btn-lg w-full text-lg font-bold' : 'btn btn-primary btn-lg w-full text-lg font-bold'"
					@click="childIsSleeping ? quickEndSleep() : quickStartSleep()"
				>
					<span v-if="childIsSleeping">⏰ Baby woke up</span>
					<span v-else>💤 Baby is sleeping</span>
				</button>
			</div>
			<div class="divider">or fill in details</div>
			<!-- Required Fields -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Start Time -->
				<TextInput
					v-model="form.startTime"
					type="datetime-local"
					label="Start Time *"
				/>
				<!-- End Time -->
				<TextInput
					v-model="form.endTime"
					type="datetime-local"
					label="End Time"
				/>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Sleep Type -->
				<SelectInput
					v-model="form.sleepType"
					label="Sleep Type *"
					:options="sleepTypeOptions"
				/>
				<!-- Location -->
				<TextInput
					v-model="form.location"
					label="Location *"
					placeholder="e.g., Crib, Bed, Stroller"
				/>
			</div>
			<!-- Sleep Quality (shown if end time is set) -->
			<div v-if="form.endTime" class="form-control">
				<label class="label">
					<span class="label-text font-medium">Sleep Quality</span>
				</label>
				<div class="flex justify-between items-center">
					<button
						type="button"
						class="btn btn-outline"
						:class="{ 'btn-error': form.quality === 'poor' }"
						@click="form.quality = 'poor'"
					>
						😴 Poor
					</button>
					<button
						type="button"
						class="btn btn-outline"
						:class="{ 'btn-warning': form.quality === 'fair' }"
						@click="form.quality = 'fair'"
					>
						😌 Fair
					</button>
					<button
						type="button"
						class="btn btn-outline"
						:class="{ 'btn-success': form.quality === 'good' }"
						@click="form.quality = 'good'"
					>
						😊 Good
					</button>
				</div>
			</div>
			<!-- Optional Fields -->
			<div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
				<input type="checkbox"/>
				<div class="collapse-title text-md font-medium">
					Additional Options
				</div>
				<div class="collapse-content">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Fall Asleep Method -->
						<SelectInput
							v-model="form.fallAsleepMethod"
							label="Fall Asleep Method"
							:options="fallAsleepMethodOptions"
						/>
						<!-- Environment -->
						<TextInput
							v-model="form.environment"
							label="Environment"
							placeholder="e.g., Dark room, White noise"
						/>
						<!-- Wake Up Behavior (shown if end time is set) -->
						<SelectInput
							v-if="form.endTime"
							v-model="form.wakeUpBehavior"
							label="Wake Up Behavior"
							:options="wakeUpBehaviorOptions"
						/>
						<!-- Wake Up Reason (shown if end time is set) -->
						<SelectInput
							v-if="form.endTime"
							v-model="form.wakeUpReason"
							label="Wake Up Reason"
							:options="wakeUpReasonOptions"
						/>
					</div>
					<!-- Notes -->
					<TextInput
						v-model="form.notes"
						type="textarea"
						label="Notes"
						placeholder="Add any additional notes here..."
						:rows="3"
						class="mt-4"
					/>
				</div>
			</div>
		</form>
		<div v-if="error" class="alert alert-error mt-4">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
			     viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
			<span>{{ error }}</span>
		</div>
	</TrackableModal>
</template>
<script setup>
import {ref, reactive, computed, watch} from 'vue';
import TrackableModal from './TrackableModal.vue';
import TextInput from '@/components/ui/TextInput.vue';
import SelectInput from '@/components/ui/SelectInput.vue';
import sleepsService from '@/services/sleeps.service';
import {
	SleepType,
	SleepQuality,
	FallAsleepMethod,
	WakeUpBehavior,
	WakeUpReason
} from '@/interfaces/trackable.interface';
import { parseDate } from '@/utils/timeUtils';
// Helper function to format dates for datetime-local inputs in the user's local timezone
const formatDateForInput = (date) => {
	if (!date) return null;
	const d = parseDate(date);
	if (!d) return null;
	// Format in YYYY-MM-DDTHH:MM format in local timezone
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
};
const props = defineProps({
	childId: {
		type: String,
		required: true
	},
	childIsSleeping: {
		type: Boolean,
		default: false
	}
});
const emit = defineEmits(['created', 'updated']);
const modal = ref(null);
const error = ref('');
const activeSleep = ref(null);
// Options for select inputs
const sleepTypeOptions = [
	{value: SleepType.NAP, label: 'Nap'},
	{value: SleepType.NIGHT, label: 'Night Sleep'},
	{value: SleepType.OTHER, label: 'Other'}
];
const sleepQualityOptions = [
	{value: SleepQuality.POOR, label: 'Poor'},
	{value: SleepQuality.FAIR, label: 'Fair'},
	{value: SleepQuality.GOOD, label: 'Good'}
];
const fallAsleepMethodOptions = [
	{value: FallAsleepMethod.ROCKING, label: 'Rocking'},
	{value: FallAsleepMethod.NURSING, label: 'Nursing'},
	{value: FallAsleepMethod.BOTTLE, label: 'Bottle'},
	{value: FallAsleepMethod.PACIFIER, label: 'Pacifier'},
	{value: FallAsleepMethod.SELF_SOOTHING, label: 'Self Soothing'},
	{value: FallAsleepMethod.OTHER, label: 'Other'}
];
const wakeUpBehaviorOptions = [
	{value: WakeUpBehavior.CALM, label: 'Calm'},
	{value: WakeUpBehavior.CRYING, label: 'Crying'},
	{value: WakeUpBehavior.FUSSY, label: 'Fussy'},
	{value: WakeUpBehavior.HAPPY, label: 'Happy'}
];
const wakeUpReasonOptions = [
	{value: WakeUpReason.NATURAL, label: 'Natural'},
	{value: WakeUpReason.NOISE, label: 'Noise'},
	{value: WakeUpReason.HUNGER, label: 'Hunger'},
	{value: WakeUpReason.DIAPER, label: 'Diaper'},
	{value: WakeUpReason.DISCOMFORT, label: 'Discomfort'},
	{value: WakeUpReason.OTHER, label: 'Other'}
];
// Default form values
const defaultForm = {
	childId: props.childId,
	sleepType: SleepType.NAP,
	startTime: formatDateForInput(new Date()),
	endTime: null,
	location: '',
	quality: SleepQuality.GOOD,
	fallAsleepMethod: null,
	environment: '',
	wakeUpBehavior: null,
	wakeUpReason: null,
	notes: '',
	isEstimated: false
};
// Reactive form object
const form = reactive({...defaultForm});
// Watch for changes to endTime to validate it
watch(() => form.endTime, (newEndTime) => {
	if (newEndTime && form.startTime) {
		const startTime = parseDate(form.startTime);
		const endTime = parseDate(newEndTime);
		if (startTime && endTime && endTime <= startTime) {
			error.value = 'End time must be after start time';
			// Optionally, reset the end time or provide visual feedback
		} else {
			// Clear error if it was previously set for this reason
			if (error.value === 'End time must be after start time') {
				error.value = '';
			}
		}
	}
});
// Auto-suggest based on time patterns
const suggestSleepType = () => {
	const currentHour = new Date().getHours();
	// Suggest night sleep between 7 PM and 6 AM
	if (currentHour >= 19 || currentHour < 6) {
		form.sleepType = SleepType.NIGHT;
	} else {
		form.sleepType = SleepType.NAP;
	}
};
// Auto-suggest location based on previous entries
const suggestLocation = async () => {
	try {
		// Get recent sleep entries
		const sleeps = await sleepsService.findAll(props.childId);
		if (sleeps && sleeps.length > 0) {
			// Find the most recent sleep entries with location
			const recentLocations = sleeps
				.filter(sleep => sleep.location)
				.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
				.slice(0, 5);
			if (recentLocations.length > 0) {
				// Use the most common location
				const locationCounts = {};
				recentLocations.forEach(sleep => {
					locationCounts[sleep.location] = (locationCounts[sleep.location] || 0) + 1;
				});
				const mostCommonLocation = Object.entries(locationCounts)
					.sort((a, b) => b[1] - a[1])[0][0];
				form.location = mostCommonLocation;
			}
		}
	} catch (error) {
		console.error('Error suggesting location:', error);
	}
};
// Calculate duration when start and end times change
const duration = computed(() => {
	if (form.startTime && form.endTime) {
		const startTime = parseDate(form.startTime);
		const endTime = parseDate(form.endTime);
		if (startTime && endTime && endTime > startTime) {
			// Calculate duration in minutes
			const durationMs = endTime - startTime;
			return Math.round(durationMs / (1000 * 60));
		}
	}
	return 0;
});
// Quick start sleep
const quickStartSleep = async () => {
	try {
		// Auto-set current time
		const now = new Date();
		form.startTime = formatDateForInput(now);
		// Only clear end time if it's not already set by the user
		const userSetEndTime = form.endTime;
		// Auto-suggest sleep type based on time
		suggestSleepType();
		// Ensure we have a location
		if (!form.location) {
			await suggestLocation();
		}
		if (!form.location) {
			form.location = 'Crib';
		}
		// Create sleep data
		const sleepData = {
			childId: props.childId,
			sleepType: form.sleepType || SleepType.NAP,
			startTime: now,
			location: form.location,
			fallAsleepMethod: form.fallAsleepMethod,
			environment: form.environment || '',
			notes: form.notes || '',
			occurredAt: now
		};
		// If end time is provided, add end-related fields
		if (userSetEndTime) {
			// Validate that end time is after start time
			const startTime = parseDate(form.startTime);
			const endTime = parseDate(userSetEndTime);
			if (!startTime || !endTime || endTime <= startTime) {
				error.value = 'End time must be after start time';
				return false;
			}
			// Ensure quality is set when end time is provided
			if (!form.quality) {
				form.quality = SleepQuality.GOOD; // Set default quality if not provided
			}
			sleepData.endTime = endTime;
			sleepData.quality = form.quality;
			sleepData.wakeUpBehavior = form.wakeUpBehavior;
			sleepData.wakeUpReason = form.wakeUpReason;
		}
		// Create the sleep entry
		const result = await sleepsService.create(sleepData);
		// Store the sleep ID for later use when ending sleep
		localStorage.setItem(`sleep_${props.childId}`, result.id);
		emit('created', result);
		// Close modal
		if (modal.value) {
			modal.value.closeModal();
		}
		return true;
	} catch (err) {
		console.error('Error creating sleep:', err);
		error.value = 'Failed to start sleep tracking. Please try again.';
		return false;
	}
};
// Quick end sleep
const quickEndSleep = async () => {
	try {
		// Get current time
		const now = new Date();
		// Only set the end time if it hasn't been manually edited
		if (!form.endTime) {
			form.endTime = formatDateForInput(now);
		}
		// If we have an active sleep, use its data
		if (activeSleep.value) {
			// Use the location from the active sleep if available
			if (activeSleep.value.location) {
				form.location = activeSleep.value.location;
			}
			// Use the sleep type from the active sleep if available
			if (activeSleep.value.sleepType) {
				form.sleepType = activeSleep.value.sleepType;
			}
			// Use the start time from the active sleep
			form.startTime = formatDateForInput(activeSleep.value.startTime || activeSleep.value.occurredAt);
			// Get the sleep ID from localStorage or use the active sleep ID
			const sleepId = localStorage.getItem(`sleep_${props.childId}`) || activeSleep.value.id;
			// Create update data - use the form's end time (which could be manually set or auto-set)
			const endTime = form.endTime ? parseDate(form.endTime) : now;
			const updateData = {
				endTime: endTime,
				quality: form.quality,
				location: form.location,
				wakeUpBehavior: form.wakeUpBehavior,
				wakeUpReason: form.wakeUpReason,
				notes: form.notes,
				occurredAt: activeSleep.value.occurredAt // Keep the original occurredAt
			};
			// Update the existing sleep record
			const result = await sleepsService.update(sleepId, updateData);
			// Clear the sleep ID from localStorage
			localStorage.removeItem(`sleep_${props.childId}`);
			emit('updated', result);
			// Close modal
			if (modal.value) {
				modal.value.closeModal();
			}
			return true;
		} else {
			error.value = 'No active sleep session found. Please fill in the form manually.';
			return false;
		}
	} catch (err) {
		console.error('Error ending sleep:', err);
		error.value = 'Failed to end sleep tracking. Please try again.';
		return false;
	}
};
// Validate form
const validateForm = () => {
	if (!form.sleepType) {
		error.value = 'Please select a sleep type';
		return false;
	}
	if (!form.location) {
		error.value = 'Please enter a location';
		return false;
	}
	if (!form.startTime) {
		error.value = 'Please select a start time';
		return false;
	}
	// If end time is provided, validate it
	if (form.endTime) {
		const startTime = parseDate(form.startTime);
		const endTime = parseDate(form.endTime);
		if (!startTime || !endTime || endTime <= startTime) {
			error.value = 'End time must be after start time';
			return false;
		}
		// Quality is required when end time is provided
		if (!form.quality) {
			error.value = 'Please select a sleep quality';
			return false;
		}
	}
	return true;
};
// Handle form submission
const handleSubmit = async () => {
	error.value = '';
	if (!validateForm()) {
		return false;
	}
	try {
		// If child is sleeping and we're ending sleep
		if (props.childIsSleeping && form.endTime) {
			// Get the sleep ID from localStorage or use the active sleep ID
			const sleepId = localStorage.getItem(`sleep_${props.childId}`) || 
				(activeSleep.value ? activeSleep.value.id : null);
			if (sleepId) {
				// Create update data
				const updateData = {
					endTime: parseDate(form.endTime),
					quality: form.quality,
					location: form.location,
					wakeUpBehavior: form.wakeUpBehavior,
					wakeUpReason: form.wakeUpReason,
					notes: form.notes
				};
				// Update the existing sleep record
				const result = await sleepsService.update(sleepId, updateData);
				// Clear the sleep ID from localStorage
				localStorage.removeItem(`sleep_${props.childId}`);
				emit('updated', result);
				return true;
			} else {
				error.value = 'No active sleep session found. Please fill in all details.';
				return false;
			}
		} 
		// If we're creating a new sleep entry (either start-only or complete)
		else {
			// Create sleep data
			const sleepData = {
				childId: props.childId,
				sleepType: form.sleepType,
				startTime: parseDate(form.startTime),
				location: form.location,
				fallAsleepMethod: form.fallAsleepMethod,
				environment: form.environment,
				notes: form.notes,
				occurredAt: parseDate(form.startTime)
			};
			// If end time is provided, add end-related fields
			if (form.endTime) {
				sleepData.endTime = parseDate(form.endTime);
				sleepData.quality = form.quality;
				sleepData.wakeUpBehavior = form.wakeUpBehavior;
				sleepData.wakeUpReason = form.wakeUpReason;
			} else {
				// If no end time, store the ID for later ending
				const result = await sleepsService.create(sleepData);
				localStorage.setItem(`sleep_${props.childId}`, result.id);
				emit('created', result);
				return true;
			}
			// Create the complete sleep entry
			const result = await sleepsService.create(sleepData);
			emit('created', result);
			return true;
		}
	} catch (err) {
		console.error('Error saving sleep:', err);
		error.value = 'Failed to save sleep. Please try again.';
		return false;
	}
};
// Find active sleep session
const findActiveSleep = async () => {
	try {
		const sleeps = await sleepsService.findAll(props.childId);
		if (sleeps && sleeps.length > 0) {
			// Sort by occurredAt in descending order
			const sortedSleeps = [...sleeps].sort((a, b) =>
				new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
			);
			// Find the most recent sleep without an end time
			const foundActiveSleep = sortedSleeps.find(s => !s.endTime);
			if (foundActiveSleep) {
				activeSleep.value = foundActiveSleep;
				// Set form values from active sleep
				form.startTime = formatDateForInput(foundActiveSleep.startTime || foundActiveSleep.occurredAt);
				form.sleepType = foundActiveSleep.sleepType;
				form.location = foundActiveSleep.location || '';
				form.fallAsleepMethod = foundActiveSleep.fallAsleepMethod;
				form.environment = foundActiveSleep.environment || '';
				form.notes = foundActiveSleep.notes || '';
			}
		}
	} catch (err) {
		console.error('Error finding active sleep:', err);
	}
};
// Reset form
const resetForm = () => {
	Object.assign(form, defaultForm);
	// Reset other state
	activeSleep.value = null;
	error.value = '';
};
// Open modal
const openModal = async () => {
	resetForm();
	// If child is sleeping, find active sleep session
	if (props.childIsSleeping) {
		await findActiveSleep();
	} else {
		// Auto-suggest for new sleep
		form.startTime = formatDateForInput(new Date());
		form.endTime = null;
		suggestSleepType();
		await suggestLocation();
	}
	modal.value.openModal();
};
defineExpose({
	openModal
});
</script>