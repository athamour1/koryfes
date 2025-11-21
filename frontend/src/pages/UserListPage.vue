<template>
  <q-page class="social-feed-page">
    <!-- Header Section -->
    <div class="feed-header">
      <div class="container">
        <h1 class="feed-title">Scouts Community</h1>
        <p class="feed-subtitle">Discover fellow scouts and their achievements</p>

        <!-- Search Bar -->
        <div class="search-section">
          <q-input
            v-model="filterName"
            outlined
            rounded
            placeholder="Search scouts by name..."
            class="search-input"
            @update:model-value="fetchUsers"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append v-if="filterName">
              <q-icon name="close" class="cursor-pointer" @click="filterName = ''; fetchUsers()" />
            </template>
          </q-input>


        </div>
      </div>
    </div>

    <!-- User Cards Grid -->
    <div class="container">
      <div class="cards-grid">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-card"
        >
          <div class="card-header">
            <q-avatar size="80px" class="user-avatar">
              <img :src="getAvatarUrl(user.username, user.profileImage)" style="border-radius: 50%; object-fit: cover;" />
            </q-avatar>

            <div class="user-info">
              <h3 class="user-name">{{ user.username }}</h3>
              <div class="user-location">
                <q-icon name="place" size="16px" />
                {{ user.location?.name || 'No location' }}
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-value">{{ user.badges?.length || 0 }}</div>
              <div class="stat-label">Badges</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">{{ user.role === 'admin' ? 'Captain' : 'Scout' }}</div>
              <div class="stat-label">Role</div>
            </div>
          </div>

          <q-separator class="card-separator" />

          <!-- Badges Section -->
          <div class="badges-section">
            <h4 class="badges-title">
              <q-icon name="military_tech" size="18px" />
              Achievements
            </h4>

            <div v-if="user.badges && user.badges.length > 0" class="badges-grid">
              <div
                v-for="badge in user.badges.slice(0, 3)"
                :key="badge.id"
                class="badge-item"
              >
                <q-avatar size="50px" class="badge-avatar">
                  <img
                    v-if="badge.image"
                    :src="`${config.apiUrl}${badge.image}`"
                  />
                  <q-icon v-else name="star" color="primary" size="30px" />
                </q-avatar>
                <q-tooltip class="badge-tooltip" anchor="top middle" self="bottom middle">
                  <div class="tooltip-content">
                    <strong>{{ badge.name }}</strong>
                    <div class="text-caption">{{ badge.description }}</div>
                  </div>
                </q-tooltip>
              </div>

              <!-- More Badges Indicator -->
              <div v-if="user.badges.length > 3" class="more-badges">
                <q-avatar size="50px" class="more-avatar">
                  <div class="more-count">+{{ user.badges.length - 3 }}</div>
                </q-avatar>
                <q-tooltip>{{ user.badges.length - 3 }} more badges</q-tooltip>
              </div>
            </div>

            <div v-else class="no-badges">
              <q-icon name="emoji_events" size="40px" color="grey-5" />
              <p>No badges yet</p>
            </div>
          </div>

          <!-- View Profile Button -->
          <div class="card-footer">
            <q-btn
              flat
              dense
              color="primary"
              label="View Profile"
              icon-right="arrow_forward"
              class="view-profile-btn"
              @click="$router.push(`/user/${user.id}`)"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <q-icon name="people_outline" size="80px" color="grey-5" />
        <h3>No scouts found</h3>
        <p>Try adjusting your filters</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '../stores/user';
import { useAuthStore } from '../stores/auth';
import { config } from '../config';
import { getAvatarUrl } from '../utils/avatar';

const userStore = useUserStore();
const authStore = useAuthStore();
const filterName = ref('');

// Filter to show only regular users (scouts) from the same location
const filteredUsers = computed(() => {
  let users = userStore.users.filter(u => u.role === 'user');

  // Filter by current user's location (unless super admin)
  if (!authStore.isSuperAdmin && authStore.user?.location?.id) {
    users = users.filter(u => u.location?.id === authStore.user.location.id);
  }

  // Apply name filter
  if (filterName.value) {
    const search = filterName.value.toLowerCase();
    users = users.filter(u => u.username.toLowerCase().includes(search));
  }

  return users;
});

const fetchUsers = async () => {
  await userStore.fetchUsers();
};

onMounted(async () => {
  await fetchUsers();
});
</script>

<style scoped>
.social-feed-page {
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 40px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.feed-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  padding: 60px 20px 80px;
  margin-bottom: -40px;
  position: relative;
  border-radius: 24px;
}

.feed-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px;
  text-align: center;
}

.feed-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 40px;
  text-align: center;
}

.search-section {
  display: flex;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.search-input {
  flex: 2;
  min-width: 250px;
}

.location-filter {
  flex: 1;
  min-width: 200px;
}

.search-input :deep(.q-field__control),
.location-filter :deep(.q-field__control) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
}

body.body--dark .search-input :deep(.q-field__control),
body.body--dark .location-filter :deep(.q-field__control) {
  background: var(--q-dark);
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 60px;
}

.user-card {
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.user-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.user-card:hover::before {
  opacity: 1;
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.user-avatar {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-avatar img {
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.user-location {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.7;
  font-size: 0.95rem;
}

/* Stats Row */
.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--q-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  opacity: 0.1;
  margin: 0 16px;
}

.card-separator {
  margin: 0 -24px 20px;
}

/* Badges Section */
.badges-section {
  margin-bottom: 20px;
}

.badges-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 12px;
  justify-items: center;
}

.badge-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.badge-item:hover {
  transform: scale(1.1);
}

.badge-avatar {
  background: transparent;
  border: none;
  border-radius: 12px;
  padding: 4px;
}

body.body--dark .badge-avatar {
  background: transparent;
  border: none;
}

.badge-avatar img {
  object-fit: cover;
  border-radius: 8px;
}

.more-badges {
  cursor: pointer;
}

.more-avatar {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
}

.more-count {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.no-badges {
  text-align: center;
  padding: 40px 20px;
  opacity: 0.5;
}

.no-badges p {
  margin: 8px 0 0;
  font-size: 0.95rem;
}

/* Card Footer */
.card-footer {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

body.body--dark .card-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.view-profile-btn {
  width: 100%;
  font-weight: 600;
}

/* Badge Tooltip */
.badge-tooltip {
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  padding: 12px;
  max-width: 200px;
}

.tooltip-content strong {
  display: block;
  margin-bottom: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  opacity: 0.6;
}

.empty-state h3 {
  margin: 16px 0 8px;
}

.empty-state p {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .feed-title {
    font-size: 2rem;
  }

  .feed-subtitle {
    font-size: 1rem;
  }

  .search-section {
    flex-direction: column;
  }

  .search-input,
  .location-filter {
    width: 100%;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .user-card {
    padding: 20px;
  }
}
</style>
