<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/auth.service';
const route = useRoute();
const router = useRouter();
const status = ref('loading');
const message = ref('Activating your account...');
onMounted(async () => {
  try {
    const token = route.query.token as string;
    if (!token) {
      status.value = 'error';
      message.value = 'Invalid activation link. Please check your email and try again.';
      return;
    }
    await authService.activateAccount(token);
    status.value = 'success';
    message.value = 'Your account has been activated successfully! You can now log in.';
  } catch (error) {
    console.error('Account activation failed:', error);
    status.value = 'error';
    message.value = error instanceof Error 
      ? error.message 
      : 'Failed to activate your account. Please try again or contact support.';
  }
});
const goToLogin = () => {
  router.push('/auth/login');
};
</script>
<template>
  <div class="activate-account-page">
    <div class="card">
      <h1>Account Activation</h1>
      <div v-if="status === 'loading'" class="loading">
        <div class="spinner"></div>
        <p>{{ message }}</p>
      </div>
      <div v-else-if="status === 'success'" class="success">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p>{{ message }}</p>
        <button @click="goToLogin" class="btn btn-primary">Go to Login</button>
      </div>
      <div v-else-if="status === 'error'" class="error">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <p>{{ message }}</p>
        <button @click="goToLogin" class="btn btn-primary">Go to Login</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.activate-account-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f9fafb;
}
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  text-align: center;
}
h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #111827;
}
.loading, .success, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3b82f6;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.icon {
  width: 40px;
  height: 40px;
}
.success .icon {
  color: #10b981;
}
.error .icon {
  color: #ef4444;
}
p {
  margin: 1rem 0;
  color: #4b5563;
}
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}
.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}
.btn-primary:hover {
  background-color: #2563eb;
}
</style>