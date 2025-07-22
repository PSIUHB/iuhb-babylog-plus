<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h3 class="card-title mb-6">Notification Preferences</h3>

			<form @submit.prevent="saveNotificationPreferences" class="space-y-6">
				<!-- Email Notifications -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						Email Notifications
					</h4>

					<div class="space-y-3">
						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Daily Summary</span>
								<div class="label-text-alt">Daily overview of your children's activities</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.email.dailySummary"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Weekly Reports</span>
								<div class="label-text-alt">Comprehensive weekly analytics and insights</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.email.weeklyReports"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Milestone Achievements</span>
								<div class="label-text-alt">When your children reach new milestones</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.email.milestones"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Family Updates</span>
								<div class="label-text-alt">New caregiver invitations and family changes</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.email.familyUpdates"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Account & Security</span>
								<div class="label-text-alt">Login alerts and security notifications</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.email.security"
								class="checkbox checkbox-primary"
							/>
						</label>
					</div>
				</div>

				<!-- Push Notifications -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						Push Notifications
					</h4>

					<div class="space-y-3">
						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Feeding Reminders</span>
								<div class="label-text-alt">Smart reminders based on feeding patterns</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.push.feedingReminders"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Sleep Tracking</span>
								<div class="label-text-alt">Notifications about sleep duration and patterns</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.push.sleepTracking"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Caregiver Activities</span>
								<div class="label-text-alt">When other caregivers log events</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.push.caregiverActivities"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Emergency Alerts</span>
								<div class="label-text-alt">Critical health and safety notifications</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.push.emergencyAlerts"
								class="checkbox checkbox-primary"
							/>
						</label>
					</div>
				</div>

				<!-- SMS Notifications -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
						SMS Notifications
					</h4>

					<div class="alert alert-info">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>SMS notifications may incur charges from your mobile carrier</span>
					</div>

					<div class="space-y-3">
						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Emergency Only</span>
								<div class="label-text-alt">Critical alerts and emergency situations</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.sms.emergencyOnly"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Daily Reminders</span>
								<div class="label-text-alt">Important daily care reminders</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.sms.dailyReminders"
								class="checkbox checkbox-primary"
							/>
						</label>
					</div>
				</div>

				<!-- Notification Timing -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Quiet Hours
					</h4>

					<div class="space-y-4">
						<label class="label cursor-pointer">
							<span class="label-text font-semibold">Enable Quiet Hours</span>
							<input
								type="checkbox"
								v-model="preferences.quietHours.enabled"
								class="checkbox checkbox-primary"
							/>
						</label>

						<div v-if="preferences.quietHours.enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Start Time</span>
								</label>
								<input
									type="time"
									v-model="preferences.quietHours.startTime"
									class="input input-bordered"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">End Time</span>
								</label>
								<input
									type="time"
									v-model="preferences.quietHours.endTime"
									class="input input-bordered"
								/>
							</div>
						</div>

						<div v-if="preferences.quietHours.enabled" class="pl-6">
							<label class="label cursor-pointer">
								<span class="label-text">Allow emergency notifications during quiet hours</span>
								<input
									type="checkbox"
									v-model="preferences.quietHours.allowEmergency"
									class="checkbox checkbox-primary"
								/>
							</label>
						</div>
					</div>
				</div>

				<!-- Smart Notifications -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
						</svg>
						Smart Notifications
					</h4>

					<div class="space-y-3">
						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Adaptive Reminders</span>
								<div class="label-text-alt">AI-powered reminders based on your patterns</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.smart.adaptiveReminders"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Pattern Insights</span>
								<div class="label-text-alt">Notifications about unusual patterns or trends</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.smart.patternInsights"
								class="checkbox checkbox-primary"
							/>
						</label>

						<label class="label cursor-pointer">
							<div>
								<span class="label-text font-semibold">Predictive Alerts</span>
								<div class="label-text-alt">Proactive notifications before issues arise</div>
							</div>
							<input
								type="checkbox"
								v-model="preferences.smart.predictiveAlerts"
								class="checkbox checkbox-primary"
							/>
						</label>
					</div>
				</div>

				<!-- Notification Frequency -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold">Notification Frequency</h4>

					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Daily Summary Time</span>
						</label>
						<select v-model="preferences.frequency.dailySummaryTime" class="select select-bordered">
							<option value="morning">Morning (8:00 AM)</option>
							<option value="afternoon">Afternoon (2:00 PM)</option>
							<option value="evening">Evening (7:00 PM)</option>
							<option value="night">Night (10:00 PM)</option>
						</select>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text font-semibold">Weekly Report Day</span>
						</label>
						<select v-model="preferences.frequency.weeklyReportDay" class="select select-bordered">
							<option value="sunday">Sunday</option>
							<option value="monday">Monday</option>
							<option value="friday">Friday</option>
							<option value="saturday">Saturday</option>
						</select>
					</div>
				</div>

				<!-- Test Notifications -->
				<div class="space-y-4">
					<h4 class="text-lg font-semibold">Test Notifications</h4>

					<div class="flex flex-wrap gap-2">
						<button
							type="button"
							class="btn btn-outline btn-sm"
							@click="sendTestNotification('email')"
							:disabled="isTesting"
						>
							Test Email
						</button>
						<button
							type="button"
							class="btn btn-outline btn-sm"
							@click="sendTestNotification('push')"
							:disabled="isTesting"
						>
							Test Push
						</button>
						<button
							type="button"
							class="btn btn-outline btn-sm"
							@click="sendTestNotification('sms')"
							:disabled="isTesting && preferences.sms.emergencyOnly"
						>
							Test SMS
						</button>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="card-actions justify-end pt-6 border-t border-base-300">
					<button
						type="button"
						class="btn btn-ghost"
						@click="resetPreferences"
						:disabled="isSaving"
					>
						Reset to Default
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						:class="{ 'loading': isSaving }"
						:disabled="isSaving"
					>
						{{ isSaving ? 'Saving...' : 'Save Preferences' }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['preferences-updated'])

// Reactive data
const isSaving = ref(false)
const isTesting = ref(false)

// Notification preferences
const preferences = reactive({
	email: {
		dailySummary: true,
		weeklyReports: true,
		milestones: true,
		familyUpdates: true,
		security: true
	},
	push: {
		feedingReminders: true,
		sleepTracking: true,
		caregiverActivities: false,
		emergencyAlerts: true
	},
	sms: {
		emergencyOnly: true,
		dailyReminders: false
	},
	quietHours: {
		enabled: true,
		startTime: '22:00',
		endTime: '07:00',
		allowEmergency: true
	},
	smart: {
		adaptiveReminders: true,
		patternInsights: true,
		predictiveAlerts: false
	},
	frequency: {
		dailySummaryTime: 'evening',
		weeklyReportDay: 'sunday'
	}
})

// Methods
const saveNotificationPreferences = async () => {
	isSaving.value = true

	try {
		await new Promise(resolve => setTimeout(resolve, 1000))

		emit('preferences-updated', { ...preferences })
		console.log('Notification preferences saved successfully!')
	} catch (error) {
		console.error('Error saving preferences:', error)
	} finally {
		isSaving.value = false
	}
}

const resetPreferences = () => {
	// Reset to default values
	preferences.email.dailySummary = true
	preferences.email.weeklyReports = true
	preferences.email.milestones = true
	preferences.email.familyUpdates = true
	preferences.email.security = true

	preferences.push.feedingReminders = true
	preferences.push.sleepTracking = true
	preferences.push.caregiverActivities = false
	preferences.push.emergencyAlerts = true

	preferences.sms.emergencyOnly = true
	preferences.sms.dailyReminders = false

	preferences.quietHours.enabled = true
	preferences.quietHours.startTime = '22:00'
	preferences.quietHours.endTime = '07:00'
	preferences.quietHours.allowEmergency = true

	preferences.smart.adaptiveReminders = true
	preferences.smart.patternInsights = true
	preferences.smart.predictiveAlerts = false

	preferences.frequency.dailySummaryTime = 'evening'
	preferences.frequency.weeklyReportDay = 'sunday'
}

const sendTestNotification = async (type) => {
	isTesting.value = true

	try {
		await new Promise(resolve => setTimeout(resolve, 1000))

		console.log(`Test ${type} notification sent!`)

		// Show success message
		alert(`Test ${type} notification sent successfully!`)
	} catch (error) {
		console.error(`Error sending test ${type} notification:`, error)
		alert(`Failed to send test ${type} notification`)
	} finally {
		isTesting.value = false
	}
}
</script>