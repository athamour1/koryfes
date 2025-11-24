import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                redirect: (to) => {
                    const authStore = useAuthStore();
                    if (authStore.isAuthenticated) {
                        return authStore.isAdmin ? '/admin/dashboard' : '/my-progress';
                    }
                    return '/login';
                }
            },
            { path: 'login', component: () => import('../pages/LoginPage.vue'), meta: { titleKey: 'auth.login.tab' } },
            { path: 'register', component: () => import('../pages/RegisterPage.vue'), meta: { titleKey: 'auth.register.tab' } },
            { path: 'forgot-password', component: () => import('../pages/ForgotPasswordPage.vue'), meta: { titleKey: 'auth.forgotPassword.title' } },

            { path: 'reset-password', component: () => import('../pages/ResetPasswordPage.vue'), meta: { titleKey: 'auth.resetPassword.title' } },
            { path: 'profile', component: () => import('../pages/ProfilePage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.profile' } },
            { path: 'my-progress', component: () => import('../pages/MyProgressPage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.myProgress' } },
            { path: 'users', component: () => import('../pages/UserListPage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.users' } },
            { path: 'user/:id', component: () => import('../pages/UserProfilePage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.users' } },
            { path: 'my-unit', component: () => import('../pages/MyUnitPage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.myUnit' } },



            // Admin Routes
            {
                path: 'admin/dashboard',
                component: () => import('../pages/admin/AdminDashboardPage.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, titleKey: 'navigation.dashboard' }
            },
            {
                path: 'admin/units',
                component: () => import('../pages/admin/AdminUnitsPage.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, titleKey: 'navigation.units' }
            },
            {
                path: 'units/:id',
                component: () => import('../pages/UnitPage.vue'),
                meta: { requiresAuth: true, titleKey: 'navigation.units' }
            },
            {
                path: 'admin/users',
                component: () => import('../pages/admin/AdminUsersPage.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, titleKey: 'navigation.adminUsers' }
            },
            {
                path: 'admin/progress',
                component: () => import('../pages/admin/AdminProgressPage.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, titleKey: 'navigation.progress' }
            },

            // Super Admin Routes
            {
                path: 'admin/locations',
                component: () => import('../pages/admin/LocationManagement.vue'),
                meta: { requiresAuth: true, requiresSuperAdmin: true, titleKey: 'navigation.locations' }
            },

            // 404 - Catch All
            {
                path: '/:pathMatch(.*)*',
                component: () => import('../pages/Error404Page.vue')
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

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
                // If fetching profile fails (e.g. invalid token), redirect to login
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

    // Unit Leader check for My Unit page
    if (to.path === '/my-unit') {
        if (authStore.user?.unitRole === 'leader') {
            next();
        } else {
            next('/my-progress'); // Redirect non-leaders
        }
        return;
    }

    next();
});

export default router;
