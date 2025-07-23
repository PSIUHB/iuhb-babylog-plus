<template>
	<div class="min-h-screen bg-base-100" data-theme="baby-light">
		<AppLayout>
			<div class="flex-1 p-6">
				<!-- Page Header -->
				<div class="mb-8">
					<h1 class="text-2xl font-bold text-base-content mb-2">Profile Settings</h1>
					<p class="text-base-content/70">Manage your personal information and account preferences</p>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<!-- Profile Overview Card -->
					<div class="lg:col-span-1">
						<ProfileOverview @avatar-updated="handleAvatarUpdate" />
					</div>

					<!-- Main Settings with Tabs -->
					<div class="lg:col-span-2">
						<div class="card bg-base-100 shadow-lg">
							<div class="card-body p-0">
								<!-- Tabs Navigation -->
								<div class="tabs tabs-boxed bg-base-200 rounded-t-lg">
									<a 
										class="tab tab-lg flex-1" 
										:class="{ 'tab-active': activeTab === 'personal' }"
										@click="activeTab = 'personal'"
									>
										Personal Info
									</a>
									<a 
										class="tab tab-lg flex-1" 
										:class="{ 'tab-active': activeTab === 'account' }"
										@click="activeTab = 'account'"
									>
										Account
									</a>
									<a 
										class="tab tab-lg flex-1" 
										:class="{ 'tab-active': activeTab === 'security' }"
										@click="activeTab = 'security'"
									>
										Security
									</a>
								</div>

								<!-- Tab Content -->
								<div class="p-6">
									<!-- Personal Information Tab -->
									<div v-if="activeTab === 'personal'">
										<PersonalInformation @profile-updated="handleProfileUpdate" />
									</div>

									<!-- Account Settings Tab -->
									<div v-if="activeTab === 'account'">
										<AccountSettings @settings-updated="handleSettingsUpdate" />
									</div>

									<!-- Security Settings Tab -->
									<div v-if="activeTab === 'security'">
										<SecuritySettings @security-updated="handleSecurityUpdate" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AppLayout>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileOverview from '@/components/profile/ProfileOverview.vue'
import PersonalInformation from '@/components/profile/PersonalInformation.vue'
import AccountSettings from '@/components/profile/AccountSettings.vue'
import SecuritySettings from "@/components/profile/SecuritySettings.vue";

// Active tab state
const activeTab = ref('personal')

// Event handlers for profile operations
const handleAvatarUpdate = (avatarData) => {
	console.log('Avatar updated:', avatarData)
	// Update user store or call API
}

const handleProfileUpdate = (profileData) => {
	console.log('Profile updated:', profileData)
	// Update user store or call API
}

const handleSettingsUpdate = (settingsData) => {
	console.log('Settings updated:', settingsData)
	// Update settings store or call API
}

const handleSecurityUpdate = (securityData) => {
	console.log('Security updated:', securityData)
	// Update security settings or call API
}
</script>