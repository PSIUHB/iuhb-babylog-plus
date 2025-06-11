import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import AppPage from '../views/AppPage.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/app',
    name: 'App',
    component: AppPage
  },
  // Redirect any unknown routes to the landing page
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Add navigation guards if needed
// For example, to protect routes that require authentication
router.beforeEach((to, from, next) => {
  // If the route requires authentication
  if (to.path.startsWith('/app')) {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      next('/auth/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
