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
              {{ $t('progress.admin.title') || 'Individual Progress' }}
            </h2>
            <p>{{ $t('progress.admin.extraStageInfo') || 'Track your journey through peaks, paths, and diplomas.' }}</p>
          </div>

          <div class="row q-col-gutter-xl q-mb-xl">
        <!-- 1. Current Peak (Left) -->
        <div class="col-12 col-md-4 text-center">
          <div v-if="user?.progress?.currentPeak">
            <q-avatar size="200px" class="peak-avatar shadow-10">
              <img :src="`${config.apiUrl}${user?.progress?.currentPeak?.image}`" style="object-fit: cover" />
            </q-avatar>
          </div>
          <div v-else class="empty-state-card">
            <q-icon name="landscape" size="60px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">{{ $t('progress.admin.noPeak') || 'No Peak Earned Yet' }}</div>
          </div>
        </div>

        <!-- 2. Diplomas (Right) -->
        <div class="col-12 col-md-8">
          <h3 class="text-h5 q-mb-md flex items-center">
            <q-icon name="school" class="q-mr-sm" color="accent" />
            {{ $t('progress.admin.diplomas.title') || 'Diplomas' }}
          </h3>
          
          <q-card class="diplomas-card">
            <q-card-section>
              <!-- Guide Diplomas -->
              <div v-if="user?.progress?.guideDiplomas && user?.progress?.guideDiplomas.length > 0">
                <div class="text-subtitle2 text-grey-7 q-mb-sm">{{ $t('progress.admin.diplomas.guide') || 'Guide Diplomas' }}</div>
                <div class="diplomas-grid">
                  <div v-for="diploma in user?.progress?.guideDiplomas" :key="diploma.id" class="diploma-item">
                    <q-avatar size="60px" class="diploma-avatar">
                      <img v-if="diploma.image" :src="`${config.apiUrl}${diploma.image}`" style="object-fit: contain" />
                      <q-icon v-else name="school" color="accent" size="30px" />
                    </q-avatar>
                    <div class="diploma-name">{{ diploma.name }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-grey-5 q-mb-md">{{ $t('progress.admin.noEarnedGuideDiplomas') || 'No Guide Diplomas Yet' }}</div>

              <q-separator class="q-my-md" />

              <!-- Elective Diplomas -->
              <div v-if="user?.progress?.electiveDiplomas && user?.progress?.electiveDiplomas.length > 0">
                <div class="text-subtitle2 text-grey-7 q-mb-sm">{{ $t('progress.admin.diplomas.elective') || 'Elective Diplomas' }}</div>
                <div class="diplomas-grid">
                  <div v-for="diploma in user?.progress?.electiveDiplomas" :key="diploma.id" class="diploma-item">
                    <q-avatar size="60px" class="diploma-avatar">
                      <img v-if="diploma.image" :src="`${config.apiUrl}${diploma.image}`" style="object-fit: contain" />
                      <q-icon v-else name="star" color="purple" size="30px" />
                    </q-avatar>
                    <div class="diploma-name">{{ diploma.name }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-grey-5">{{ $t('progress.admin.noEarnedElectiveDiplomas') || 'No Elective Diplomas Yet' }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 3. Completed Paths (Bottom) -->
      <div>
        <h3 class="text-h5 q-mb-md flex items-center">
          <q-icon name="explore" class="q-mr-sm" color="secondary" />
          {{ $t('progress.admin.paths.title') || 'Completed Paths' }} ({{ user?.progress?.completedPaths?.length || 0 }})
        </h3>
        
        <div v-if="user?.progress?.completedPaths && user?.progress?.completedPaths.length > 0">
          <q-card class="paths-text-card">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div v-for="path in user?.progress?.completedPaths" :key="path.id" class="col-12 col-sm-6 col-md-4">
                  <div class="flex items-center path-item-text">
                    <q-icon name="check_circle" color="secondary" size="sm" class="q-mr-sm flex-shrink-0" />
                    <span class="text-body1 path-name-text">{{ path.name }}</span>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div v-else class="empty-state-card">
          <q-icon name="map" size="60px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">{{ $t('progress.admin.noEarnedPaths') || 'No Paths Completed Yet' }}</div>
        </div>
      </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { config } from '@/config';
import { date } from 'quasar';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import PageHeader from '@/components/PageHeader.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const { t } = useI18n();

// Computed property to combine auth user data with fetched progress
const user = computed(() => {
  return {
    ...authStore.user,
    progress: userStore.userProgress
  };
});

const formatUnitRole = (unitRole) => {
  if (!unitRole) return '-';
  switch(unitRole) {
    case 'leader': return t('adminUsers.roles.leader');
    case 'deputy_leader': return t('adminUsers.roles.deputyLeader');
    case 'member': return t('adminUsers.roles.member');
    default: return unitRole;
  }
};

onMounted(async () => {
  // Ensure we have the latest profile data
  await authStore.fetchProfile();
  // Fetch the user's progress
  await userStore.fetchMyProgress();
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
