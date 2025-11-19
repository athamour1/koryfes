<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Scout Badges
        </q-toolbar-title>

        <div v-if="authStore.isAuthenticated">
          <q-btn flat label="My Badges" to="/my-badges" />
          <q-btn flat label="Users" to="/users" />
          <q-btn v-if="authStore.isAdmin" flat label="Admin Users" to="/admin/users" color="warning" />
          <q-btn v-if="authStore.isAdmin" flat label="Admin Badges" to="/admin/badges" color="warning" />
          <q-btn flat label="Profile" to="/profile" />
          <q-btn flat label="Logout" @click="logout" />
        </div>
        <div v-else>
          <q-btn flat label="Login" to="/login" />
          <q-btn flat label="Register" to="/register" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
