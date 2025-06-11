<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
  try {
    // Here you would typically make an API call to authenticate the user
    // For now, we'll just simulate a successful login
    console.log('Logging in with:', { email: email.value, password: password.value });

    // Set authentication state
    localStorage.setItem('isAuthenticated', 'true');

    // Redirect to the app after successful login
    router.push('/app');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
</script>

<template>
  <div class="login-page">
    <h1>Login</h1>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          v-model="email" 
          type="email" 
          required 
          placeholder="Enter your email"
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
        />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
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

button {
  margin-top: 1rem;
  padding: 0.75rem;
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
