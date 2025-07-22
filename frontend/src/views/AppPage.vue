<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import DashboardWelcome from '@/components/dashboard/DashboardWelcome.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import BabyCardsGrid from '@/components/child/BabyCardsGrid.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import DashboardCharts from '@/components/dashboard/DashboardCharts.vue'

import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

// Initialize the auth store and check authentication
onMounted(() => {
  // Initialize auth state from localStorage
  authStore.init();

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/auth/login');
  }
});

const logout = () => {
  // Use the auth store to logout
  authStore.logout();
  // Redirect to login page
  router.push('/auth/login');
};

</script>

<template>
	<div class="min-h-screen bg-base-100" data-theme="baby-light">
		<AppLayout>
			<div class="flex-1 p-6">
				<DashboardWelcome />
				<DashboardStats />
				<BabyCardsGrid />
    			<div class="mb-6">
					<RecentActivity />
				</div>
				<DashboardCharts />
			</div>
		</AppLayout>
	</div>
</template>

<style>
</style>
