<template>
  <q-page class="user-profile-page">
    <!-- Hero Header -->
    <div class="q-pa-md">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1400px; margin: 0 auto;">
        <div class="flex items-center q-mb-md">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            class="text-white q-mr-md"
            @click="$router.back()"
          >
            <q-tooltip>{{ $t('general.back') }}</q-tooltip>
          </q-btn>
        </div>
        
        <div class="profile-hero">
          <div class="profile-avatar-wrapper shadow-10" v-if="user">
            <AvatarDisplay :config="user.avatarConfig" size="120px" />
          </div>
          
          <div class="profile-info">
            <h1 class="profile-name">{{ user?.username }}</h1>
            <div class="text-subtitle1 text-grey-5 q-mb-md">
              <q-icon name="place" size="sm" class="q-mr-xs" />
              {{ user?.location?.name || $t('userProfilePage.noLocation') }}
            </div>

            <div v-if="!isAdmin" class="unit-role-card-hero q-mt-md">
              <div class="unit-section">
                <div class="text-caption text-white-7">{{ $t('userListPage.unitLabel') || 'Unit' }}</div>
                <div class="text-weight-bold">{{ user?.unit?.name || '-' }}</div>
              </div>
              <div class="unit-divider-hero"></div>
              <div class="role-section">
                <div class="text-caption text-white-7">{{ $t('userListPage.roleLabel') || 'Role' }}</div>
                <div class="text-weight-bold">{{ formatUnitRole(user?.unitRole) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Section -->
    <div v-if="!isAdmin" class="q-pa-lg" style="max-width: 1400px; margin: 0 auto;">
      <q-card flat bordered>
        <q-card-section>
          <div class="section-header">
            <h2>
              <q-icon name="insights" size="32px" />
              {{ $t('progress.title') }}
            </h2>
            <p>{{ $t('progress.subtitle') }}</p>
          </div>

          <ProgressOverview :progress="user?.progress" :peaks="progressStore.peaks" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api';
import { date } from 'quasar';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import ProgressOverview from '@/components/progress/ProgressOverview.vue';
import { useProgressStore } from '@/stores/progress';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const progressStore = useProgressStore();
const { t } = useI18n();
const user = ref(null);

// Check if the user being displayed is an admin or super admin
const isAdmin = computed(() => {
  return user.value?.role === 'admin' || user.value?.role === 'super_admin';
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return date.formatDate(dateString, 'MMM D, YYYY');
};

const fetchUserProfile = async () => {
  try {
    const userId = route.params.id;
    const response = await api.get(`/users/${userId}`);
    
    if (!response.data) {
      router.push('/users');
      return;
    }

    const fetchedUser = response.data;

    // Access Control:
    // 1. Super Admins can see everyone
    // 2. Regular users/admins can only see users in their location
    if (!authStore.isSuperAdmin) {
      const myLocationId = authStore.user?.location?.id;
      const userLocationId = fetchedUser.location?.id;

      if (myLocationId !== userLocationId) {
        router.push('/users');
        return;
      }
    }

    user.value = fetchedUser;
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    router.push('/users');
  }
};

const formatUnitRole = (unitRole) => {
  if (!unitRole) return '-';
  switch(unitRole) {
    case 'leader': return t('adminUsers.roles.leader');
    case 'deputy_leader': return t('adminUsers.roles.deputyLeader');
    case 'member': return t('adminUsers.roles.member');
    default: return unitRole;
  }
};

onMounted(() => {
  fetchUserProfile();
  progressStore.fetchCatalog();
});

onBeforeUnmount(() => {
  // Clean up user data before component unmounts
  user.value = null;
});
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
}

/* Header Section */
.gradient-purple {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
}

.profile-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  padding: 30px 20px 60px;
  position: relative;
  margin-bottom: -30px;
}

.back-btn {
  margin-bottom: 20px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 40px;
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

.profile-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
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

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin: 12px 0 4px;
}

.stat-label {
  font-size: 0.95rem;
  opacity: 0.9;
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

/* Badges Grid */
.badges-detailed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.badge-detail-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.badge-detail-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.badge-card-image {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.03);
  padding: 20px;
}

body.body--dark .badge-card-image {
  background: rgba(255, 255, 255, 0.05);
}

.badge-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.badge-card-content {
  padding: 20px;
}

.badge-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px;
}

.badge-description {
  opacity: 0.7;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.badge-card-footer {
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

body.body--dark .badge-card-footer {
  background: rgba(255, 255, 255, 0.05);
}

/* Empty State */
.empty-badges {
  text-align: center;
  padding: 80px 20px;
  opacity: 0.6;
}

.empty-badges h3 {
  margin: 20px 0 8px;
  font-size: 1.5rem;
}

.empty-badges p {
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

.empty-state-card.small {
  padding: 20px;
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
  .profile-hero {
    flex-direction: column;
    text-align: center;
  }

  .profile-name {
    font-size: 2rem;
  }

  .profile-meta {
    justify-content: center;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .paths-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .diplomas-grid {
    justify-content: center;
  }
  
  .paths-text-card .row > div {
    /* Single column on mobile for more horizontal space */
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .path-name-text {
    font-size: 0.9rem;
  }
}
</style>
