<template>
	<div class="navbar bg-base-100 shadow-sm border-b border-base-300">
		<div class="flex-none lg:hidden">
			<label for="sidebar-drawer" class="btn btn-square btn-ghost">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</label>
		</div>

		<div class="flex-1">
			<img class="lg:hidden babylog-logo" src="./../../assets/images/logo/babylogplus.png" alt="BabyLog+ Logo">
		</div>

		<div class="flex-none flex items-center gap-2">

			<!-- User Menu -->
			<UserDropdown />
		</div>
	</div>
</template>

<script setup>
import UserDropdown from '../ui/UserDropdown.vue'
</script>