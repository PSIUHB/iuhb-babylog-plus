<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth.service';

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const router = useRouter();

const register = async () => {
  try {
    // Reset messages
    errorMessage.value = '';
    successMessage.value = '';

    // Validate passwords match
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match';
      return;
    }

    // Validate password length
    if (password.value.length < 6) {
      errorMessage.value = 'Password must be at least 6 characters long';
      return;
    }

    // Set loading state
    isLoading.value = true;

    // Call the auth service to register the user
    await authService.register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value
    });

    // Clear form
    firstName.value = '';
    lastName.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';

    // Show success message
    successMessage.value = 'Registration successful! Please check your email for an activation link.';
  } catch (error) {
    // Handle registration error
    console.error('Registration failed:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="register-page">
    <h1>Register</h1>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    <form @submit.prevent="register" class="register-form">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input 
          id="firstName" 
          v-model="firstName" 
          type="text" 
          required 
          placeholder="Enter your first name"
          :disabled="isLoading"
        />
      </div>
      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input 
          id="lastName" 
          v-model="lastName" 
          type="text" 
          required 
          placeholder="Enter your last name"
          :disabled="isLoading"
        />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          v-model="email" 
          type="email" 
          required 
          placeholder="Enter your email"
          :disabled="isLoading"
        />
      </div>
      <div class="form-group">
        <label for="password">Password <span class="password-hint">(min. 6 characters)</span></label>
        <input 
          id="password" 
          v-model="password" 
          type="password" 
          required 
          placeholder="Enter your password (min. 6 characters)"
          :disabled="isLoading"
        />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          id="confirmPassword" 
          v-model="confirmPassword" 
          type="password" 
          required 
          placeholder="Confirm your password"
          :disabled="isLoading"
        />
      </div>
      <button 
        type="submit" 
        class="btn btn-primary" 
        :disabled="isLoading"
      >
        {{ isLoading ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <div class="links">
      <p>Already have an account? <router-link to="/auth/login">Login</router-link></p>
      <p><router-link to="/">Back to Home</router-link></p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.error-message {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #f87171;
  border-radius: 4px;
  text-align: center;
}

.success-message {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
  border-radius: 4px;
  text-align: center;
}

.register-form {
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
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #4338ca;
}

button:disabled {
  background-color: #a5b4fc;
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

.password-hint {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: normal;
}
</style>
