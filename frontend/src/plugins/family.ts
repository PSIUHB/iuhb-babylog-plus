import { useFamilyStore } from '@/stores/family.store';

/**
 * Plugin to initialize the family store when the app starts
 */
export default {
  install: (app: any) => {
    // Get the family store instance
    const familyStore = useFamilyStore();
    
    // Initialize the family store
    familyStore.init();
    
    // Make the family store available globally
    app.provide('familyStore', familyStore);
  }
};