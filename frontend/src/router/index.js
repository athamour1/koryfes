import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', redirect: '/login' },
            { path: 'login', component: () => import('../pages/LoginPage.vue') },
            { path: 'register', component: () => import('../pages/RegisterPage.vue') },
            { path: 'profile', component: () => import('../pages/ProfilePage.vue'), meta: { requiresAuth: true } },
            { path: 'my-badges', component: () => import('../pages/MyBadgesPage.vue'), meta: { requiresAuth: true } },
            { path: 'users', component: () => import('../pages/UserListPage.vue'), meta: { requiresAuth: true } },
            { path: 'admin/users', component: () => import('../pages/admin/AdminUsersPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
            { path: 'admin/badges', component: () => import('../pages/admin/AdminBadgesPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
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
    } else if (to.meta.requiresAdmin) {
        if (!authStore.user) {
            await authStore.fetchProfile();
        }
        if (authStore.isAdmin) {
            next();
        } else {
            next('/my-badges'); // Redirect non-admins
        }
    } else {
        next();
    }
});

export default router;
