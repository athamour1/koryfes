<template>
  <q-page class="user-profile-page">
    <!-- Header Section -->
    <div class="profile-header">
      <div class="container">
        <q-btn
          flat
          icon="arrow_back"
          label="Back to Directory"
          color="white"
          class="back-btn"
          @click="$router.push('/users')"
        />
        
        <div class="profile-hero">
          <q-avatar size="120px" class="profile-avatar">
            <img :src="getAvatarUrl(user?.username, user?.profileImage)" style="object-fit: cover" />
          </q-avatar>
          
          <div class="profile-info">
            <h1 class="profile-name">{{ user?.username }}</h1>
            <div class="text-subtitle1 text-grey-5 q-mb-md row items-center justify-center">
              <q-icon name="place" size="sm" class="q-mr-xs" />
              {{ user.location?.name || 'No Location' }}
            </div>

            <q-chip
              v-if="user.unit"
              clickable
              @click="$router.push(`/units/${user.unit.id}`)"
              color="primary"
              text-color="white"
              icon="groups"
              class="q-mb-md"
            >
              {{ user.unit.name }}
            </q-chip>
            <div class="profile-meta">
              <div class="meta-item">
                <q-icon name="person" size="20px" />
                {{ user?.role === 'admin' ? 'Captain' : 'Scout' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-cards">
          <div class="stat-card">
            <q-icon name="military_tech" size="40px" color="white" />
            <div class="stat-number">{{ user?.badges?.length || 0 }}</div>
            <div class="stat-label">Badges Earned</div>
          </div>
          <div class="stat-card">
            <q-icon name="emoji_events" size="40px" color="white" />
            <div class="stat-number">{{ achievementRate }}%</div>
            <div class="stat-label">Achievement Rate</div>
          </div>
          <div class="stat-card">
            <q-icon name="trending_up" size="40px" color="white" />
            <div class="stat-number">{{ user?.role === 'user' ? 'Active' : 'Admin' }}</div>
            <div class="stat-label">Status</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Badges Section -->
    <div class="container content-section">
      <div class="section-header">
        <h2>
          <q-icon name="workspace_premium" size="32px" />
          Badge Collection
        </h2>
        <p>{{ user?.badges?.length || 0 }} badges earned</p>
      </div>

      <!-- Badges Grid -->
      <div v-if="user?.badges && user.badges.length > 0" class="badges-detailed-grid">
        <q-card
          v-for="badge in user.badges"
          :key="badge.id"
          class="badge-detail-card"
        >
          <div class="badge-card-image">
            <img
              v-if="badge.image"
              :src="`${config.apiUrl}${badge.image}`"
              class="badge-image"
            />
            <q-icon v-else name="star" size="80px" color="primary" />
          </div>
          
          <q-card-section class="badge-card-content">
            <h3 class="badge-name">{{ badge.name }}</h3>
            <p class="badge-description">{{ badge.description || 'No description available' }}</p>
          </q-card-section>

          <q-card-section class="badge-card-footer">
            <div class="row items-center justify-between full-width">
              <q-chip icon="check_circle" color="positive" text-color="white" size="sm">
                Earned
              </q-chip>
              <div class="text-caption text-grey-7" v-if="badge.acquiredAt">
                {{ formatDate(badge.acquiredAt) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-badges">
        <q-icon name="emoji_events" size="100px" color="grey-4" />
        <h3>No Badges Yet</h3>
        <p>This scout hasn't earned any badges yet. Check back later!</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { api } from '../api';
import { config } from '../config';
import { getAvatarUrl } from '../utils/avatar';
import { date } from 'quasar';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const user = ref(null);
const totalBadges = ref(75); // Could fetch from API

const achievementRate = computed(() => {
  if (!user.value?.badges || totalBadges.value === 0) return 0;
  return Math.round((user.value.badges.length / totalBadges.value) * 100);
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

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Section */
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

.profile-avatar {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
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

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
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

/* Content Section */
.content-section {
  padding: 60px 20px 40px;
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

  .badges-detailed-grid {
    grid-template-columns: 1fr;
  }
}
</style>
