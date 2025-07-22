<template>
	<div class="drawer-side">
		<label for="sidebar-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<aside class="bg-base-100 min-h-full w-80 p-4 border-r border-base-300">
			<!-- Logo -->
			<div class="flex items-center gap-3 mb-8">
				<img class="hidden lg:block babylog-logo" src="./../../assets/images/logo/babylogplus.png" alt="BabyLog+ Logo">
			</div>

			<!-- Navigation Menu -->
			<SidebarNavigation />

			<!-- Caregivers Section -->
			<ActiveCaregivers />
		</aside>
	</div>
</template>

<script setup>
import SidebarNavigation from './SidebarNavigation.vue'
import ActiveCaregivers from '../family/ActiveCaregivers.vue'
</script>