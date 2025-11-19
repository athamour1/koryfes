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
          class="q-mr-sm lt-md"
          v-if="authStore.isAuthenticated"
        />

        <q-toolbar-title>
          Scout Badges
        </q-toolbar-title>

        <!-- Desktop Navigation -->
        <div v-if="authStore.isAuthenticated" class="gt-sm">
          <q-btn v-if="authStore.isAdmin" flat label="Dashboard" to="/admin/dashboard" />
          <q-btn v-if="!authStore.isAdmin" flat label="My Badges" to="/my-badges" />
          <q-btn flat label="Users" to="/users" />
          <q-btn v-if="authStore.isAdmin" flat label="Admin Users" to="/admin/users" />
          <q-btn v-if="authStore.isAdmin" flat label="Admin Badges" to="/admin/badges" />
          <q-btn flat label="Profile" to="/profile" />
        </div>
        <div v-else class="gt-sm">
          <q-btn flat label="Login" to="/login" />
          <q-btn flat label="Register" to="/register" />
        </div>

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

        <!-- Logout Button -->
        <q-btn v-if="authStore.isAuthenticated" flat label="Logout" @click="logout" class="gt-sm" />
      </q-toolbar>
    </q-header>

    <!-- Mobile Drawer -->
    <q-drawer
      v-model="drawer"
      :width="250"
      :breakpoint="768"
      bordered
      class="lt-md"
      v-if="!isAuthPage"
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

          <q-item clickable v-ripple to="/profile">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>Profile</q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable v-ripple @click="logout">
            <q-item-section avatar>
              <q-icon name="logout" />
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
const drawer = ref(false); // Default closed

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
