import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import ActivateAccountPage from '../views/ActivateAccountPage.vue';
import CreateFamilyPage from '../views/CreateFamilyPage.vue';
import InvitationsPage from '../views/InvitationsPage.vue';
import AppPage from '../views/AppPage.vue';
import FamilyPage from "../views/FamilyPage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import { useFamilyStore } from '../stores/family.store';

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
    path: '/auth/activate',
    name: 'ActivateAccount',
    component: ActivateAccountPage
  },
  {
    path: '/create-family',
    name: 'CreateFamily',
    component: CreateFamilyPage
  },
  {
    path: '/app',
    name: 'App',
    component: AppPage
  },
  {
    path: '/app/family',
    name: 'Family',
    component: FamilyPage
  },
  {
    path: '/app/settings',
    name: 'Settings',
    component: ProfilePage
  },
  {
    path: '/app/invitations',
    name: 'Invitations',
    component: InvitationsPage
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

// Add navigation guards to protect routes that require authentication
router.beforeEach((to, _from, next) => {
  // Routes that require authentication
  if (to.path.startsWith('/app') || to.path === '/create-family') {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page if not authenticated
      return next('/auth/login');
    } 

    // If trying to access app routes, check if user has a family
    if (to.path.startsWith('/app')) {
      // Check authentication status first before checking families
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        return next('/auth/login');
      }

      const familyStore = useFamilyStore();

      // If families are already loaded, check if user has a family
      if (familyStore.families.length) {
        if (!familyStore.currentFamily) {
          // Check for pending invitations
          import('../services/auth.service').then(module => {
            const authService = module.default;
            authService.getPendingInvitations()
              .then(pendingInvitations => {
                if (pendingInvitations.length > 0) {
                  // If user has pending invitations, redirect to invitations page
                  next('/app/invitations');
                } else {
                  // If user has no families and no pending invitations, redirect to create-family
                  next('/create-family');
                }
              })
              .catch(error => {
                console.error('Error fetching invitations:', error);
                // If there's an error fetching invitations, redirect to create-family
                next('/create-family');
              });
          });
          return; // Stop execution here to prevent multiple redirects
        }
        return next();
      }

      // If families aren't loaded yet, fetch them
      familyStore.fetchFamilies()
        .then(() => {
          if (!familyStore.currentFamily) {
            // Check for pending invitations
            import('../services/auth.service').then(module => {
              const authService = module.default;
              authService.getPendingInvitations()
                .then(pendingInvitations => {
                  if (pendingInvitations.length > 0) {
                    // If user has pending invitations, redirect to invitations page
                    next('/app/invitations');
                  } else {
                    // If user has no families and no pending invitations, redirect to create-family
                    next('/create-family');
                  }
                })
                .catch(error => {
                  console.error('Error fetching invitations:', error);
                  // If there's an error fetching invitations, redirect to create-family
                  next('/create-family');
                });
            });
          } else {
            next();
          }
        })
        .catch((error) => {
          console.error('Error fetching families:', error);
          // If there's an unauthorized error, redirect to login
          if (error instanceof Error && error.message === 'Unauthorized') {
            return next('/auth/login');
          }
          // For other errors, still allow navigation
          next();
        });
      return;
    }

    // For non-app authenticated routes (like create-family)
    return next();
  }

  // For public routes
  return next();
});

export default router;
