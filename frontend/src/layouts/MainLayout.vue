<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="bg-primary rounded-header" v-if="!isAuthPage">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="drawer = !drawer"
          class="q-mr-sm"
          v-if="authStore.isAuthenticated"
        />

        <q-toolbar-title>
          {{ pageTitle }}
        </q-toolbar-title>

        <!-- Dark Mode Toggle -->
        <q-btn
          flat
          dense
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          @click="toggleDarkMode"
          class="q-ml-sm"
        >
          <q-tooltip>{{ $q.dark.isActive ? $t('navigation.toggleLight') : $t('navigation.toggleDark') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Side Drawer -->
    <q-drawer
      v-model="drawer"
      :width="250"
      :breakpoint="768"
      bordered
      v-if="authStore.isAuthenticated && !isAuthPage"
    >
      <q-list>
        <q-item-label header>{{ $t('navigation.header') }}</q-item-label>

        <template v-if="authStore.isAuthenticated">
          <q-item clickable v-ripple to="/my-progress" v-if="!authStore.isAdmin" data-cy="nav-my-progress">
            <q-item-section avatar>
              <q-icon name="emoji_events" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.myProgress') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/users" data-cy="nav-users">
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.users') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/my-unit" v-if="authStore.user?.role === 'user' && authStore.user?.unit?.id" exact-active-class="active-link" active-class="active-link">
            <q-item-section avatar>
              <q-icon name="groups" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.myUnit') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/profile" data-cy="nav-profile">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.profile') }}</q-item-section>
          </q-item>

          <!-- Admin Section -->
          <template v-if="authStore.isAdmin">
            <q-separator class="q-my-md" />
            <q-item-label header>{{ $t('navigation.administration') }}</q-item-label>

            <q-item clickable v-ripple to="/admin/dashboard" data-cy="nav-admin-dashboard">
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.dashboard') }}</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/units" data-cy="nav-admin-units">
              <q-item-section avatar>
                <q-icon name="groups" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('navigation.units') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/users" data-cy="nav-admin-users">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.adminUsers') }}</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/progress" v-if="authStore.isAdmin" data-cy="nav-admin-progress">
              <q-item-section avatar>
                <q-icon name="trending_up" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.progress') }}</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/locations" v-if="authStore.isSuperAdmin" data-cy="nav-admin-locations">
              <q-item-section avatar>
                <q-icon name="location_on" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.locations') }}</q-item-section>
            </q-item>
          </template>

          <q-separator />

          <!-- User Info Header -->
          <q-item-label header class="text-weight-bold">{{ authStore.user?.username || 'User' }}</q-item-label>

          <q-item clickable v-ripple @click="logout" class="text-negative" data-cy="nav-logout">
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.logout') }}</q-item-section>
          </q-item>
        </template>

        <template v-else>
          <q-item clickable v-ripple to="/login">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>{{ $t('navigation.login') }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- PWA Install Prompt -->
    <PWAInstallPrompt />
  </q-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PWAInstallPrompt from '@/components/PWAInstallPrompt.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

// Open drawer by default on desktop (>768px), closed on mobile
const drawer = ref($q.screen.gt.sm);

// Check if current route is the login page
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/';
});

// Watch for authentication changes and open drawer on login
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && !isAuthPage.value) {
    drawer.value = true;
  }
});

// Page Title Logic
const pageTitle = computed(() => {
  if ($q.screen.lt.md && route.meta.titleKey) {
    return t(route.meta.titleKey);
  }
  return t('navigation.title');
});

// Initialize dark mode from localStorage
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode !== null) {
  $q.dark.set(savedDarkMode === 'true');
}

const toggleDarkMode = () => {
  $q.dark.toggle();
  localStorage.setItem('darkMode', $q.dark.isActive);
};

const logout = () => {
  authStore.logout();
  router.push('/login');
  drawer.value = false;
};
</script>

<style scoped>
.rounded-header {
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  padding: 0 16px;
}
</style>
