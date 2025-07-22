<template>
	<div class="dropdown dropdown-end">
		<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar p-2 flex items-center justify-center">
			<img :src="user?.avatarUrl || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'" :alt="user?.firstName || 'User'" class="rounded-full" />
		</div>
		<ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg">
			<li v-if="user" class="p-2 text-center font-medium">
				{{ user.firstName }} {{ user.lastName }}
			</li>
			<div v-if="user" class="divider my-1"></div>
			<li><router-link to="/profile">Profile</router-link></li>
			<li><router-link to="/settings">Settings</router-link></li>
			<li><a href="/help" target="_blank">Help</a></li>
			<div class="divider my-1"></div>
			<li><a class="text-error" @click="handleLogout">Logout</a></li>
		</ul>
	</div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.getUser)

const handleLogout = () => {
	// Use the auth store to logout
	authStore.logout()
	console.log('Logging out...')
	router.push('/auth/login')
}
</script>
