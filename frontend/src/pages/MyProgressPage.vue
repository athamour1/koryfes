<template>
  <q-page class="tf-page">
    <PageHeader
      icon="emoji_events"
      :title="$t('navigation.myProgress')"
      :subtitle="[user?.username, user?.location?.name].filter(Boolean).join(' · ')"
    />

    <ProgressOverviewSkeleton v-if="!userStore.userProgress" />
    <ProgressOverview v-else :progress="userStore.userProgress" :peaks="progressStore.peaks" />
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useProgressStore } from '@/stores/progress';
import ProgressOverview from '@/components/progress/ProgressOverview.vue';
import ProgressOverviewSkeleton from '@/components/skeletons/ProgressOverviewSkeleton.vue';
import PageHeader from '@/components/PageHeader.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const progressStore = useProgressStore();

// Computed property to combine auth user data with fetched progress
const user = computed(() => {
  return {
    ...authStore.user,
    progress: userStore.userProgress
  };
});

onMounted(async () => {
  // Ensure we have the latest profile data
  await authStore.fetchProfile();
  // Fetch the user's progress and the catalog (to name the next peak)
  await Promise.all([userStore.fetchMyProgress(), progressStore.fetchCatalog()]);
});
</script>
