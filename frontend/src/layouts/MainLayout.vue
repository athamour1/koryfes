<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary">
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
          Scout Badges
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
          <q-tooltip>Toggle {{ $q.dark.isActive ? 'Light' : 'Dark' }} Mode</q-tooltip>
        </q-btn>

        <!-- User Menu -->
        <q-btn v-if="authStore.isAuthenticated" flat round dense icon="account_circle" class="q-ml-sm">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item-label header>{{ authStore.user?.username || 'User' }}</q-item-label>
              <q-item clickable v-ripple v-close-popup :to="'/profile'">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-ripple @click="logout" class="text-negative">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Side Drawer -->
    <q-drawer
      v-model="drawer"
      :width="250"
      :breakpoint="768"
      bordered
      v-if="authStore.isAuthenticated"
    >
      <q-list>
        <q-item-label header>Navigation</q-item-label>

        <template v-if="authStore.isAuthenticated">
          <q-item clickable v-ripple to="/admin/dashboard" v-if="authStore.isAdmin">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/my-badges" v-if="!authStore.isAdmin">
            <q-item-section avatar>
              <q-icon name="emoji_events" />
            </q-item-section>
            <q-item-section>My Badges</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/users">
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>Users</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/users" v-if="authStore.isAdmin">
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>Admin Users</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/badges" v-if="authStore.isAdmin">
            <q-item-section avatar>
              <q-icon name="stars" />
            </q-item-section>
            <q-item-section>Admin Badges</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/locations" v-if="authStore.isSuperAdmin">
            <q-item-section avatar>
              <q-icon name="location_on" />
            </q-item-section>
            <q-item-section>Locations</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/profile">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>Profile</q-item-section>
          </q-item>

          <q-separator />

          <!-- User Info Header -->
          <q-item-label header class="text-weight-bold">{{ authStore.user?.username || 'User' }}</q-item-label>

          <q-item clickable v-ripple @click="logout" class="text-negative">
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </template>

        <template v-else>
          <q-item clickable v-ripple to="/login">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>Login</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/register">
            <q-item-section avatar>
              <q-icon name="person_add" />
            </q-item-section>
            <q-item-section>Register</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
// Open drawer by default on desktop (>768px), closed on mobile
const drawer = ref($q.screen.gt.sm);

// Check if current route is login or register
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register' || route.path === '/';
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
