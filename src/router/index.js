import { defineRouter } from '#q-app/wrappers';
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/authStore';
import { useRaterAuthStore } from 'src/stores/authStore_raters';
import { useEmailStore } from 'src/stores/emailStore';
import { Notify } from 'quasar';

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const raterAuthStore = useRaterAuthStore();
    const emailStore = useEmailStore();

    // ========================================================================
    // ADMIN ROUTES PERMISSION CHECK
    // ========================================================================

    // Check if route requires authentication
    if (to.meta.auth) {
      // Admin routes
      if (to.meta.role === 'admin') {
        // Check authentication
        if (!authStore.isAuthenticated) {
          Notify.create({
            type: 'warning',
            message: 'Please login to continue',
            position: 'top',
          });
          return next({ name: 'Admin Login' });
        }

        // Verify token is still valid
        const isValid = await authStore.checkAuth();
        if (!isValid) {
          Notify.create({
            type: 'warning',
            message: 'Session expired. Please login again.',
            position: 'top',
          });
          return next({ name: 'Admin Login' });
        }

        // Check permissions if specified in route meta
        const requiredPermissions = to.meta.permissions;
        if (requiredPermissions && requiredPermissions.length > 0) {
          const userRole = authStore.user?.user_role || authStore.user?.role;
          const userPermissions = authStore.user?.permissions;

          // Admin bypass - admins have all permissions
          const isAdmin = userRole === 'admin' || userRole === 'superadmin';

          if (!isAdmin) {
            const hasRequiredPermission = requiredPermissions.some(
              (permission) => userPermissions?.[permission] === '1',
            );

            if (!hasRequiredPermission) {
              Notify.create({
                type: 'error',
                message: 'You do not have permission to access this page',
                position: 'top',
                timeout: 3000,
              });
              return next({ name: 'Admin Dashboard', query: { unauthorized: true } });
            }
          }
        }
      }
      // Rater routes
      else if (to.meta.role === 'rater') {
        await raterAuthStore.checkAuth_rater();
        if (!raterAuthStore.isAuthenticated) {
          Notify.create({
            type: 'warning',
            message: 'Please login to continue',
            position: 'top',
          });
          return next({ name: 'Rater Login' });
        }
      }
      // User routes - SIMPLIFIED: Just check authentication, no PDS check
      else if (to.meta.role === 'user') {
        // Check authentication only
        const authStatus = await emailStore.checkAuthPDSStatus();

        if (!authStatus.isAuthenticated) {
          Notify.create({
            type: 'warning',
            message: 'Please login to continue',
            position: 'top',
          });
          return next({ name: 'Email' });
        }

        // Define routes that don't require authentication
        const publicRoutes = ['Email', 'Terms', 'Privacy'];

        // If the route is a public route (login, terms, privacy), allow access
        if (publicRoutes.includes(to.name)) {
          return next();
        }

        // User is authenticated - allow access to all protected routes
        // No PDS check - users can access all routes regardless of PDS status
        return next();
      }
    }

    // Check guest routes (login pages)
    if (to.meta.guest) {
      // Admin login page
      if (to.meta.role === 'admin') {
        if (authStore.isAuthenticated) {
          return next({ name: 'Admin Dashboard' });
        }
      }
      // Rater login page
      else if (to.meta.role === 'rater') {
        await raterAuthStore.checkAuth_rater();
        if (raterAuthStore.isAuthenticated) {
          return next({ name: 'Raters Homepage' });
        }
      }
      // User login page - SIMPLIFIED: Just check authentication
      else if (to.meta.role === 'user') {
        const authStatus = await emailStore.checkAuthPDSStatus();
        if (authStatus.isAuthenticated) {
          // Always redirect to Homepage after login
          // Remove the PDS check and always go to /page
          return next({ name: 'Homepage' });
        }
      }
    }

    // No redirection needed
    return next();
  });

  return Router;
});
