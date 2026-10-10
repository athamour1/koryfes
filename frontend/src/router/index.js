import { defineRouter } from '#q-app'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from '@/stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : (import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  // Navigation guards
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Check token expiration before any navigation
    const isAuthValid = authStore.checkAuth();

    // Redirect authenticated users away from the login page
    const authPages = ['/login', '/'];
    if (authPages.includes(to.path) && authStore.token && isAuthValid) {
      // User is authenticated and trying to access login
      // Redirect to appropriate page based on role
      if (authStore.isAdmin) {
        next('/admin/dashboard');
      } else {
        next('/my-progress');
      }
      return;
    }

    // If checkAuth determined token is expired, it already called logout
    // In this case, redirect to login if not already going there
    if (!isAuthValid && to.meta.requiresAuth && to.path !== '/login') {
      next('/login');
      return;
    }

    // Check if route requires auth
    if (to.meta.requiresAuth) {
      // If no token, redirect to login
      if (!authStore.token) {
        next('/login');
        return;
      }

      // If we have a token but no user data, fetch it
      if (!authStore.user) {
        try {
          await authStore.fetchProfile();
        } catch (error) {
          // If fetching profile fails, the 401 interceptor will handle logout
          // Just redirect to login here
          next('/login');
          return;
        }
      }
    }

    // Role-based checks
    if (to.meta.requiresAdmin || to.meta.requiresSuperAdmin) {
      if (to.meta.requiresSuperAdmin) {
        if (authStore.isSuperAdmin) {
          next();
        } else {
          next('/admin/dashboard'); // Downgrade to admin dashboard or forbidden
        }
        return;
      }

      if (authStore.isAdmin) {
        next();
      } else {
        next('/my-progress'); // Redirect non-admins
      }
      return;
    }

    // Unit Member check for My Unit page
    if (to.path === '/my-unit') {
      if (authStore.user?.unit?.id) {
        next(); // Allow all unit members
      } else {
        next('/my-progress'); // Redirect users without a unit
      }
      return;
    }

    next();
  });

  return Router
})
