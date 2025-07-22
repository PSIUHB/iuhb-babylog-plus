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

					<!-- Main Settings -->
					<div class="lg:col-span-2 space-y-6">
						<!-- Personal Information -->
						<PersonalInformation @profile-updated="handleProfileUpdate" />

						<!-- Account Settings -->
						<AccountSettings @settings-updated="handleSettingsUpdate" />

						<!-- Notification Preferences -->
						<NotificationPreferences @preferences-updated="handleNotificationUpdate" />

						<!-- Security Settings -->
						<SecuritySettings @security-updated="handleSecurityUpdate" />

						<!-- Data & Privacy -->
						<DataPrivacySettings @privacy-updated="handlePrivacyUpdate" />
					</div>
				</div>
			</div>
		</AppLayout>
	</div>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileOverview from '@/components/profile/ProfileOverview.vue'
import PersonalInformation from '@/components/profile/PersonalInformation.vue'
import AccountSettings from '@/components/profile/AccountSettings.vue'
import NotificationPreferences from '@/components/profile/NotificationPreferences.vue'
import SecuritySettings from '@/components/profile/SecuritySettings.vue'
import DataPrivacySettings from '@/components/profile/DataPrivacySettings.vue'

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

const handleNotificationUpdate = (notificationData) => {
	console.log('Notifications updated:', notificationData)
	// Update notification preferences or call API
}

const handleSecurityUpdate = (securityData) => {
	console.log('Security updated:', securityData)
	// Update security settings or call API
}

const handlePrivacyUpdate = (privacyData) => {
	console.log('Privacy updated:', privacyData)
	// Update privacy settings or call API
}
</script>