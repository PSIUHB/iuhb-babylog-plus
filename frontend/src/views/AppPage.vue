<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// This is a simple authentication check
// In a real application, you would check if the user is authenticated
// and redirect to the login page if not
onMounted(() => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) {
    router.push('/auth/login');
  }
});

const logout = () => {
  // Clear authentication state
  localStorage.removeItem('isAuthenticated');
  // Redirect to login page
  router.push('/auth/login');
};
</script>

<template>
  <div class="app-page">
    <header class="app-header">
      <h1>BabyLogPlus</h1>
      <button @click="logout" class="btn btn-secondary">Logout</button>
    </header>
    
    <main class="app-content">
      <h2>Welcome to Your Dashboard</h2>
      <p>This is the main application area. Your baby tracking features will appear here.</p>
      
      <div class="placeholder-content">
        <div class="placeholder-card">
          <h3>Recent Activities</h3>
          <p>No recent activities to display.</p>
        </div>
        
        <div class="placeholder-card">
          <h3>Quick Actions</h3>
          <button class="btn btn-primary">Add New Entry</button>
          <button class="btn">View Reports</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.app-content {
  flex: 1;
  padding: 2rem;
}

h2 {
  margin-bottom: 1rem;
}

.placeholder-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.placeholder-card {
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
}

.placeholder-card h3 {
  margin-bottom: 1rem;
}

.placeholder-card button {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>