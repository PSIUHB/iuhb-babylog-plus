<template>
	<div class="dropdown dropdown-end w-full">
  		<a role="button" href="javascript:void(0)" class="flex items-center justify-center w-full p-0">
			<Avatar
				:src="user?.avatarUrl"
				:name="user?.firstName + ' ' + user?.lastName || 'User'"
				size="xs"
			/>
		</a>
		<ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg">
			<li v-if="user" class="px-2 py-2 font-medium">
				{{ user.firstName }} {{ user.lastName }}
			</li>
			<li><router-link to="/app/settings">Profile</router-link></li>
			<div class="divider my-1"></div>
			<li><a class="text-error" @click="handleLogout">Logout</a></li>
		</ul>
	</div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'
import Avatar from '@/components/ui/Avatar.vue'

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
