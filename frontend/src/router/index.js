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
                        return authStore.isAdmin ? '/admin/dashboard' : '/my-badges';
                    }
                    return '/login';
                }
            },
            { path: 'login', component: () => import('../pages/LoginPage.vue') },
            { path: 'register', component: () => import('../pages/RegisterPage.vue') },
            { path: 'forgot-password', component: () => import('../pages/ForgotPasswordPage.vue') },

            { path: 'reset-password', component: () => import('../pages/ResetPasswordPage.vue') },
            { path: 'profile', component: () => import('../pages/ProfilePage.vue'), meta: { requiresAuth: true } },
            { path: 'my-badges', component: () => import('../pages/MyBadgesPage.vue'), meta: { requiresAuth: true } },
            { path: 'users', component: () => import('../pages/UserListPage.vue'), meta: { requiresAuth: true } },


            // Admin Routes
            {
                path: 'admin/dashboard',
                component: () => import('../pages/admin/AdminDashboardPage.vue'),
                meta: { requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'admin/users',
                component: () => import('../pages/admin/AdminUsersPage.vue'),
                meta: { requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'admin/badges',
                component: () => import('../pages/admin/AdminBadgesPage.vue'),
                meta: { requiresAuth: true, requiresAdmin: true }
            },

            // Super Admin Routes
            {
                path: 'admin/locations',
                component: () => import('../pages/admin/LocationManagement.vue'),
                meta: { requiresAuth: true, requiresSuperAdmin: true }
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

    if (to.meta.requiresAuth && !authStore.token) {
        next('/login');
        return;
    }

    if (to.meta.requiresAdmin || to.meta.requiresSuperAdmin) {
        if (!authStore.user) {
            await authStore.fetchProfile();
        }

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
            next('/my-badges'); // Redirect non-admins
        }
        return;
    }

    next();
});

export default router;
