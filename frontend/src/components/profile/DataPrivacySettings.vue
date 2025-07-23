<template>
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h3 class="card-title mb-6">Data & Privacy Settings</h3>

			<!-- Data Collection Preferences -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Data Collection</h4>

				<div class="space-y-4">
					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Analytics & Usage Data</span>
							<div class="label-text-alt">Help improve BabyLog+ by sharing anonymous usage statistics</div>
						</div>
						<input
							type="checkbox"
							v-model="privacySettings.allowAnalytics"
							class="checkbox checkbox-primary"
						/>
					</label>

					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Crash Reports</span>
							<div class="label-text-alt">Automatically send crash reports to help fix bugs</div>
						</div>
						<input
							type="checkbox"
							v-model="privacySettings.allowCrashReports"
							class="checkbox checkbox-primary"
						/>
					</label>

					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Research Participation</span>
							<div class="label-text-alt">Participate in anonymized research studies about infant care</div>
						</div>
						<input
							type="checkbox"
							v-model="privacySettings.allowResearch"
							class="checkbox checkbox-primary"
						/>
					</label>

					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Personalized Recommendations</span>
							<div class="label-text-alt">Use your data to provide personalized insights and recommendations</div>
						</div>
						<input
							type="checkbox"
							v-model="privacySettings.allowPersonalization"
							class="checkbox checkbox-primary"
						/>
					</label>
				</div>
			</div>

			<!-- Data Visibility -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Data Visibility</h4>

				<div class="space-y-4">
					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Show in Family Timeline</span>
							<div class="label-text-alt">Display your activities in the shared family timeline</div>
						</div>
						<input
							type="checkbox"
							v-model="privacySettings.showInTimeline"
							class="checkbox checkbox-primary"
						/>
					</label>

					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Profile Visibility</span>
							<div class="label-text-alt">Allow other family members to see your profile information</div>
						</div>
						<input
							type="checkbox"
							v-model="privacySettings.profileVisibility"
							class="checkbox checkbox-primary"
						/>
					</label>

					<label class="label cursor-pointer">
						<div>
							<span class="label-text font-semibold">Activity Status</span>
							<div class="label-text-alt">Show when you're online and active in the app</div>
						</div>
						<input
							type="checkbox"
							v-model="privacySettings.showActivityStatus"
							class="checkbox checkbox-primary"
						/>
					</label>
				</div>
			</div>

			<!-- Data Retention -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Data Retention</h4>

				<div class="space-y-4">
					<SelectInput
						v-model="privacySettings.activityLogRetention"
						label="Keep activity logs for:"
						:options="activityLogRetentionOptions"
						helpText="How long to keep detailed activity logs"
					/>

					<SelectInput
						v-model="privacySettings.photoRetention"
						label="Auto-delete old photos after:"
						:options="photoRetentionOptions"
						helpText="Automatically remove old photos to save space"
					/>
				</div>
			</div>

			<!-- Data Export & Download -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Your Data</h4>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="card bg-base-200 border border-base-300">
						<div class="card-body">
							<h5 class="font-bold">Export All Data</h5>
							<p class="text-sm text-base-content/70 mb-4">
								Download a complete copy of your family's data in JSON format
							</p>
							<button
								class="btn btn-outline btn-sm"
								@click="exportAllData"
								:disabled="isExporting"
							>
								{{ isExporting ? 'Preparing...' : 'Export Data' }}
							</button>
						</div>
					</div>

					<div class="card bg-base-200 border border-base-300">
						<div class="card-body">
							<h5 class="font-bold">Generate Report</h5>
							<p class="text-sm text-base-content/70 mb-4">
								Create a PDF report of your children's activities and milestones
							</p>
							<button
								class="btn btn-outline btn-sm"
								@click="generateReport"
								:disabled="isGeneratingReport"
							>
								{{ isGeneratingReport ? 'Creating...' : 'Generate Report' }}
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Third-Party Integrations -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Third-Party Integrations</h4>

				<div class="space-y-4">
					<div
						v-for="integration in integrations"
						:key="integration.id"
						class="flex items-center justify-between p-4 border border-base-300 rounded-lg"
					>
						<div class="flex items-center gap-3">
							<div class="avatar">
								<div class="w-10 h-10 rounded-lg">
									<img :src="integration.logo" :alt="integration.name" />
								</div>
							</div>
							<div>
								<div class="font-semibold">{{ integration.name }}</div>
								<div class="text-sm text-base-content/70">{{ integration.description }}</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<div
								v-if="integration.connected"
								class="badge badge-success badge-sm"
							>
								Connected
							</div>
							<button
								class="btn btn-ghost btn-sm"
								@click="toggleIntegration(integration)"
							>
								{{ integration.connected ? 'Disconnect' : 'Connect' }}
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Data Requests -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Data Requests</h4>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<button
						class="btn btn-outline"
						@click="requestDataCopy"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m3 0a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Request Data Copy
					</button>

					<button
						class="btn btn-outline"
						@click="requestDataCorrection"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Request Correction
					</button>

					<button
						class="btn btn-outline btn-error"
						@click="requestDataDeletion"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Request Deletion
					</button>
				</div>

				<div class="text-sm text-base-content/60">
					<p>Under GDPR and other privacy laws, you have the right to:</p>
					<ul class="list-disc list-inside mt-2 space-y-1">
						<li>Request a copy of all your personal data</li>
						<li>Request correction of inaccurate data</li>
						<li>Request deletion of your data (right to be forgotten)</li>
						<li>Data portability to another service</li>
					</ul>
				</div>
			</div>

			<!-- Privacy Information -->
			<div class="space-y-6 mb-8">
				<h4 class="text-lg font-semibold">Privacy Information</h4>

				<div class="space-y-3">
					<div class="flex justify-between items-center p-3 bg-base-200 rounded-lg">
						<span class="text-sm">Data stored since:</span>
						<span class="text-sm font-semibold">{{ formatDate(privacyInfo.dataStoredSince) }}</span>
					</div>

					<div class="flex justify-between items-center p-3 bg-base-200 rounded-lg">
						<span class="text-sm">Last privacy policy update:</span>
						<span class="text-sm font-semibold">{{ formatDate(privacyInfo.lastPolicyUpdate) }}</span>
					</div>

					<div class="flex justify-between items-center p-3 bg-base-200 rounded-lg">
						<span class="text-sm">Data processing purpose:</span>
						<span class="text-sm font-semibold">{{ privacyInfo.processingPurpose }}</span>
					</div>
				</div>

				<div class="flex gap-2">
					<a href="/privacy-policy" target="_blank" class="btn btn-ghost btn-sm">
						Privacy Policy
					</a>
					<a href="/terms-of-service" target="_blank" class="btn btn-ghost btn-sm">
						Terms of Service
					</a>
					<a href="/cookie-policy" target="_blank" class="btn btn-ghost btn-sm">
						Cookie Policy
					</a>
				</div>
			</div>

			<!-- Save Settings -->
			<div class="card-actions justify-end pt-6 border-t border-base-300">
				<button
					class="btn btn-primary"
					:class="{ 'loading': isSaving }"
					:disabled="isSaving"
					@click="savePrivacySettings"
				>
					{{ isSaving ? 'Saving...' : 'Save Privacy Settings' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import SelectInput from '@/components/ui/SelectInput.vue'

const emit = defineEmits(['privacy-updated'])

// Options for select inputs
const activityLogRetentionOptions = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
  { value: 'forever', label: 'Forever' }
]

const photoRetentionOptions = [
  { value: 'never', label: 'Never delete' },
  { value: '365', label: '1 year' },
  { value: '730', label: '2 years' },
  { value: '1095', label: '3 years' },
  { value: '1825', label: '5 years' }
]

// Reactive data
const isSaving = ref(false)
const isExporting = ref(false)
const isGeneratingReport = ref(false)

// Privacy settings
const privacySettings = reactive({
	allowAnalytics: true,
	allowCrashReports: true,
	allowResearch: false,
	allowPersonalization: true,
	showInTimeline: true,
	profileVisibility: true,
	showActivityStatus: true,
	activityLogRetention: '365',
	photoRetention: 'never'
})

// Third-party integrations
const integrations = ref([
	{
		id: 1,
		name: 'Google Health',
		description: 'Sync health data with Google Fit',
		logo: 'https://img.icons8.com/color/48/google-logo.png',
		connected: false
	},
	{
		id: 2,
		name: 'Apple Health',
		description: 'Share data with Apple HealthKit',
		logo: 'https://img.icons8.com/ios-filled/50/mac-os.png',
		connected: true
	},
	{
		id: 3,
		name: 'Pediatrician Portal',
		description: 'Share reports with your healthcare provider',
		logo: 'https://img.icons8.com/fluency/48/health-book.png',
		connected: false
	}
])

// Privacy information
const privacyInfo = ref({
	dataStoredSince: '2024-01-15',
	lastPolicyUpdate: '2024-05-01',
	processingPurpose: 'Baby care tracking and family coordination'
})

// Methods
const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

const savePrivacySettings = async () => {
	isSaving.value = true

	try {
		await new Promise(resolve => setTimeout(resolve, 1000))

		emit('privacy-updated', { ...privacySettings })
		console.log('Privacy settings saved successfully!')
	} catch (error) {
		console.error('Error saving privacy settings:', error)
	} finally {
		isSaving.value = false
	}
}

const exportAllData = async () => {
	isExporting.value = true

	try {
		await new Promise(resolve => setTimeout(resolve, 2000))

		// Simulate creating and downloading a file
		const data = {
			exportDate: new Date().toISOString(),
			familyData: {
				children: ['Anna', 'Ben'],
				events: 1247,
				caregivers: 4
			},
			// ... more data
		}

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)

		const a = document.createElement('a')
		a.href = url
		a.download = `babylog-data-export-${new Date().toISOString().split('T')[0]}.json`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)

		console.log('Data export completed')
	} catch (error) {
		console.error('Error exporting data:', error)
	} finally {
		isExporting.value = false
	}
}

const generateReport = async () => {
	isGeneratingReport.value = true

	try {
		await new Promise(resolve => setTimeout(resolve, 3000))

		console.log('PDF report generated')
		alert('Report generated successfully! Check your downloads folder.')
	} catch (error) {
		console.error('Error generating report:', error)
	} finally {
		isGeneratingReport.value = false
	}
}

const toggleIntegration = (integration) => {
	integration.connected = !integration.connected
	console.log(`${integration.name} ${integration.connected ? 'connected' : 'disconnected'}`)
}

const requestDataCopy = () => {
	console.log('Data copy request submitted')
	alert('Your request has been submitted. You will receive a copy of your data within 30 days.')
}

const requestDataCorrection = () => {
	console.log('Data correction request submitted')
	alert('Your correction request has been submitted. We will review and update your data within 7 days.')
}

const requestDataDeletion = () => {
	console.log('Data deletion request submitted')
	alert('Your deletion request has been submitted. Please note that this will permanently remove all your data.')
}
</script>