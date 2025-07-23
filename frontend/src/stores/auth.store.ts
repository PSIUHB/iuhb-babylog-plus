import { defineStore } from 'pinia';
import authService from '../services/auth.service';
import type { RegisterRequest, UserProfile } from '@/interfaces';
import { useFamilyStore } from './family.store';

// Define the LoginRequest interface locally
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
  },

  actions: {
    async register(userData: RegisterRequest) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.register(userData);
        this.token = response.accessToken;
        this.user = response.user;
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials: LoginRequest) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(credentials);
        this.token = response.accessToken;
        this.user = response.user;
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      authService.logout();
      this.token = null;
      this.user = null;

      // Reset the family store to prevent redirection loops
      const familyStore = useFamilyStore();
      familyStore.reset();
    },

    async fetchUserProfile() {
      if (!this.token) return;

      this.loading = true;

      try {
        const user = await authService.getProfile();
        this.user = user;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch user profile';
        // If there's an authentication error, clear the state
        if (error instanceof Error && error.message.includes('401')) {
          this.logout();
        }
      } finally {
        this.loading = false;
      }
    },

    // Initialize auth state from localStorage
    init() {
      const token = authService.getToken();
      if (token) {
        this.token = token;
        this.fetchUserProfile();
      }
    }
  }
});
