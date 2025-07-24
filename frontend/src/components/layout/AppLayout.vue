<template>
	<div class="drawer lg:drawer-open">
		<input id="sidebar-drawer" type="checkbox" class="drawer-toggle" v-model="isSidebarOpen" />
		<!-- Main Content -->
		<div class="drawer-content flex flex-col">
			<AppNavbar />
			<slot />
		</div>
		<!-- Sidebar -->
		<AppSidebar />
	</div>
</template>
<script setup>
import { ref } from 'vue'
import AppNavbar from './AppNavbar.vue'
import AppSidebar from './AppSidebar.vue'
const isSidebarOpen = ref(false)
</script>