<template>
  <q-page class="user-profile-page">
    <!-- Hero Header -->
    <PageHeader 
      icon="insights"
      :title="user?.username || 'My Progress'"
      :subtitle="user?.location?.name || $t('userProfilePage.noLocation')"
    />

    <!-- Progress Section -->
    <div class="q-pa-md" style="max-width: 1400px; margin: 0 auto;">
      <q-card flat bordered>
          <div class="section-header">
            <h2>
              <q-icon name="insights" size="32px" />
              {{ $t('progress.title') }}
            </h2>
            <p>{{ $t('progress.subtitle') }}</p>
          </div>

          <q-card-section>
            <ProgressOverview :progress="userStore.userProgress" :peaks="progressStore.peaks" />
          </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useProgressStore } from '@/stores/progress';
import ProgressOverview from '@/components/progress/ProgressOverview.vue';
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

<style scoped>
.user-profile-page {
  min-height: 100vh;
}


.gradient-purple {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 32px;
}

.profile-avatar-wrapper {
  border-radius: 50%;
  overflow: hidden;
  background: white;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  flex: 1;
  color: white;
}

.profile-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: white;
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}

.unit-role-card-hero {
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  max-width: 400px;
}

.unit-section,
.role-section {
  flex: 1;
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.unit-divider-hero {
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

/* Content Section */
.content-section {
  padding: 60px 20px 40px;
}

.floating-card {
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

body.body--dark .floating-card {
  background: #1e1e1e;
}

.section-header {
  margin-bottom: 32px;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px;
}

.section-header p {
  opacity: 0.7;
  margin: 0;
  font-size: 1.1rem;
}

/* Progress Specific Styles */
.peak-card {
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(0,0,0,0.05);
}

body.body--dark .peak-card {
  background: linear-gradient(135deg, #1d1d1d 0%, #2d2d2d 100%);
  border-color: rgba(255,255,255,0.05);
}

.peak-avatar {
  border: 4px solid white;
}

body.body--dark .peak-avatar {
  border-color: #333;
}

.diplomas-card {
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
}

body.body--dark .diplomas-card {
  background: #1d1d1d;
  border-color: rgba(255,255,255,0.05);
}

.paths-text-card {
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
}

body.body--dark .paths-text-card {
  background: #1d1d1d;
  border-color: rgba(255,255,255,0.05);
}

.empty-state-card {
  background: rgba(0,0,0,0.02);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  border: 2px dashed rgba(0,0,0,0.1);
}

body.body--dark .empty-state-card {
  background: rgba(255,255,255,0.02);
  border-color: rgba(255,255,255,0.1);
}

.path-item-text {
  min-width: 0;
  flex: 1;
}

.path-name-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.diplomas-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.diploma-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  text-align: center;
}

.diploma-avatar {
  background: rgba(0,0,0,0.03);
  margin-bottom: 8px;
}

body.body--dark .diploma-avatar {
  background: rgba(255,255,255,0.05);
}

.diploma-name {
  font-size: 0.75rem;
  line-height: 1.2;
  color: #666;
  font-weight: 500;
}

body.body--dark .diploma-name {
  color: #aaa;
}

/* Responsive */
@media (max-width: 768px) {
  .diplomas-grid {
    justify-content: center;
  }
  
  .paths-text-card .row > div {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .path-name-text {
    font-size: 0.9rem;
  }
}
</style>
