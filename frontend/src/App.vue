<script setup lang="ts">
// App.vue is the root component that contains the router view
</script>

<template>
  <router-view />
</template>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  height: 100%;
}

#app {
  height: 100%;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  border: 1px solid #4f46e5;
}

.btn-primary:hover {
  background-color: #4338ca;
  border-color: #4338ca;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}
</style>
