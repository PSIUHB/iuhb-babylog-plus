<template>
	<div class="dropdown dropdown-end">
		<div tabindex="0" role="button" class="btn btn-ghost btn-circle p-0 flex items-center justify-center">
			<span class="relative flex items-center justify-center w-8 h-8">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				<span class="badge badge-xs badge-primary absolute -top-1 -right-1">{{ notifications.length }}</span>
			</span>
		</div>
		<div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-80 shadow-lg">
			<div class="card-body">
				<span class="text-lg font-bold">{{ notifications.length }} New Notifications</span>
				<div class="space-y-2">
					<div
						v-for="notification in notifications"
						:key="notification.id"
						class="alert py-2"
						:class="notification.type === 'info' ? 'alert-info' : 'alert-warning'"
					>
						<span class="text-sm">{{ notification.message }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const notifications = ref([
	{ id: 1, message: "Anna's feeding time reminder", type: 'info' },
	{ id: 2, message: "Ben hasn't slept in 4 hours", type: 'warning' },
	{ id: 3, message: "Weekly report is ready", type: 'info' }
])
</script>