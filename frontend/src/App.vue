<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();

// Initialize refresh timer when app starts
onMounted(() => {
  authStore.initializeRefreshTimer();
});
</script>
