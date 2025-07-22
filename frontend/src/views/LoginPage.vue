<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useFamilyStore } from '@/stores/family.store';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();
const familyStore = useFamilyStore();

const login = async () => {
  try {
    // Reset error message
    errorMessage.value = '';

    // Use the auth store to login
    await authStore.login({
      email: email.value,
      password: password.value
    });

    // Check if the user's account is active
    // Only show the not activated message if isActive is explicitly set to false
    if (authStore.user && authStore.user.isActive === false) {
      errorMessage.value = 'Your account is not activated. Please check your email for the activation link.';
      authStore.logout();
      return;
    }

    // Fetch families to check if user has any
    await familyStore.fetchFamilies();

    // If user doesn't have a family, redirect to create family page
    if (!familyStore.currentFamily) {
      router.push('/create-family');
    } else {
      // Otherwise, redirect to the app
      router.push('/app');
    }
  } catch (error) {
    console.error('Login failed:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Login failed. Please try again.';
  }
};
</script>

<template>
  <div class="login-page">
    <h1>Login</h1>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          v-model="email" 
          type="email" 
          required 
          placeholder="Enter your email"
          :disabled="authStore.loading"
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password" 
          v-model="password" 
          type="password" 
          required 
          placeholder="Enter your password"
          :disabled="authStore.loading"
        />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="authStore.loading">
        {{ authStore.loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <div class="links">
      <p>Don't have an account? <router-link to="/auth/register">Register</router-link></p>
      <p><router-link to="/">Back to Home</router-link></p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-form {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

button {
  margin-top: 1rem;
  padding: 0.75rem;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.links {
  margin-top: 2rem;
  text-align: center;
}

.links a {
  color: #4f46e5;
  text-decoration: underline;
}
</style>
