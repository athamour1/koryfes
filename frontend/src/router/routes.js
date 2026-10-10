const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/login'
      },
      { path: 'login', component: () => import('@/pages/LoginPage.vue'), meta: { titleKey: 'auth.login.tab' } },

      { path: 'forgot-password', component: () => import('@/pages/ForgotPasswordPage.vue'), meta: { titleKey: 'auth.forgotPassword.title' } },
      { path: 'reset-password', component: () => import('@/pages/ResetPasswordPage.vue'), meta: { titleKey: 'auth.resetPassword.title' } },
      { path: 'profile', component: () => import('@/pages/ProfilePage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.profile' } },
      { path: 'my-progress', component: () => import('@/pages/MyProgressPage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.myProgress' } },
      { path: 'users', component: () => import('@/pages/UserListPage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.users' } },
      { path: 'user/:id', component: () => import('@/pages/UserProfilePage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.users' } },
      { path: 'my-unit', component: () => import('@/pages/MyUnitPage.vue'), meta: { requiresAuth: true, titleKey: 'navigation.myUnit' } },

      // Admin Routes
      {
        path: 'admin/dashboard',
        component: () => import('@/pages/admin/AdminDashboardPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, titleKey: 'navigation.dashboard' }
      },
      {
        path: 'admin/units',
        component: () => import('@/pages/admin/AdminUnitsPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, titleKey: 'navigation.units' }
      },
      {
        path: 'units/:id',
        component: () => import('@/pages/UnitPage.vue'),
        meta: { requiresAuth: true, titleKey: 'navigation.units' }
      },
      {
        path: 'admin/users',
        component: () => import('@/pages/admin/AdminUsersPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, titleKey: 'navigation.adminUsers' }
      },
      {
        path: 'admin/progress',
        component: () => import('@/pages/admin/AdminProgressPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, titleKey: 'navigation.progress' }
      },


      // Super Admin Routes
      {
        path: 'admin/locations',
        component: () => import('@/pages/admin/LocationManagement.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true, titleKey: 'navigation.locations' }
      },

      // Temporary Scarf Test Route
      {
        path: 'scarf-test',
        component: () => import('@/pages/ScarfTestPage.vue'),
        meta: { requiresAuth: false }
      },

      // 404 - Catch All
      {
        path: '/:catchAll(.*)*',
        component: () => import('@/pages/ErrorNotFound.vue')
      }
    ]
  }
]

export default routes
