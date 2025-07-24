import { useAuthStore } from '@/stores/auth.store';
/**
 * Plugin to initialize the auth store when the app starts
 */
export default {
  install: (app: any) => {
    // Get the auth store instance
    const authStore = useAuthStore();
    // Initialize the auth store
    authStore.init();
    // Make the auth store available globally
    app.provide('authStore', authStore);
  }
};