<template>
  <q-page class="social-feed-page">
    <!-- Header Section -->
    <PageHeader 
      icon="people"
      :title="$t('userListPage.title')"
      :subtitle="$t('userListPage.subtitle')"
    >
      <template #extra>
        <!-- Search Bar -->
        <div class="search-section q-mt-md">
          <q-input
            v-model="filterName"
            outlined
            rounded
            :placeholder="$t('userListPage.searchPlaceholder')"
            class="search-input"
            @update:model-value="fetchUsers"
            dark
            dense
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append v-if="filterName">
              <q-icon name="close" class="cursor-pointer" @click="filterName = ''; fetchUsers()" />
            </template>
          </q-input>
        </div>
      </template>
    </PageHeader>

    <!-- User Cards Grid -->
    <div class="container">
      <div class="cards-grid">
        <q-card
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-card"
          flat
          bordered
        >
          <!-- Card Header with Avatar and User Info -->
          <q-card-section class="card-header">
            <div style="display: flex; align-items: center; gap: 16px; width: 100%;">
              <div class="user-avatar-wrapper shadow-2" :key="`avatar-div-${user.id}`" style="flex-shrink: 0;">
                <AvatarDisplay :config="user.avatarConfig" size="80px" :key="`avatar-${user.id}`" />
              </div>

              <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;">
                <h3 class="user-name" style="margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ user.username }}</h3>
                <div class="user-location" style="display: flex; align-items: center; gap: 4px; font-size: 0.95rem; opacity: 0.7;">
                  <q-icon name="place" size="16px" />
                  {{ user.location?.name || $t('userListPage.noLocation') }}
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Unit & Role Section -->
          <q-card-section class="q-pt-none">
            <div style="display: flex; border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden; background: rgba(0, 0, 0, 0.02);">
              <div style="flex: 1; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                <div class="text-caption text-grey-7">{{ $t('userListPage.unitLabel') }}</div>
                <div class="text-weight-bold">{{ user.unit?.name || '-' }}</div>
              </div>
              <div style="width: 1px; background: rgba(0, 0, 0, 0.1);"></div>
              <div style="flex: 1; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                <div class="text-caption text-grey-7">{{ $t('userListPage.roleLabel') }}</div>
                <div class="text-weight-bold">{{ formatUnitRole(user.unitRole) }}</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Progress Section -->
          <q-card-section style="flex-grow: 1; display: flex; flex-direction: column;">
            <h4 style="font-size: 1rem; font-weight: 600; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
              <q-icon name="trending_up" size="18px" />
              {{ $t('progress.admin.currentPeak') || 'Current Peak' }}
            </h4>

            <div v-if="user.progress?.currentPeak" style="display: flex; align-items: center; gap: 16px;">
              <q-avatar size="50px" class="badge-avatar">
                <img :src="`${config.apiUrl}${user.progress.currentPeak.image}`" style="object-fit: cover" />
              </q-avatar>
              <div style="flex: 1; min-width: 0;">
                <div class="text-weight-bold text-subtitle1" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ user.progress.currentPeak.name }}</div>
                <div class="text-caption text-grey-7">{{ $t('progress.admin.peaks.' + user.progress.currentPeak.name.toLowerCase()) }}</div>
              </div>
            </div>

            <div v-else class="no-badges" style="text-align: center; padding: 20px; opacity: 0.5;">
              <q-icon name="landscape" size="40px" color="grey-5" />
              <p style="margin: 8px 0 0; font-size: 0.95rem;">{{ $t('progress.admin.noPeak') || 'No Peak Earned Yet' }}</p>
            </div>
          </q-card-section>

          <!-- View Profile Button -->
          <q-card-actions style="padding: 12px 16px; border-top: 1px solid rgba(0, 0, 0, 0.05);">
            <q-btn
              flat
              dense
              color="primary"
              :label="$t('userListPage.viewProfile')"
              icon-right="arrow_forward"
              style="width: 100%; font-weight: 600;"
              @click="$router.push(`/user/${user.id}`)"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <q-icon name="people_outline" size="80px" color="grey-5" />
        <h3>{{ $t('userListPage.emptyState.title') }}</h3>
        <p>{{ $t('userListPage.emptyState.subtitle') }}</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from 'src/stores/user';
import { useAuthStore } from 'src/stores/auth';
import { config } from 'src/config';
import AvatarDisplay from 'src/components/AvatarDisplay.vue';
import PageHeader from 'src/components/PageHeader.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const filterName = ref('');
const { t } = useI18n();

// Filter to show only regular users (guides) from the same location
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

/* Search section within header */
.search-section {
  display: flex;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.search-input :deep(.q-field__control) {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.user-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 20px !important;
  border-width: 4px !important;
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
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.user-card:hover::before {
  opacity: 1;
}

/* Card Header */
.card-header {
  padding: 16px !important;
}

.user-avatar-wrapper {
  border-radius: 50%;
  overflow: hidden;
  background: white;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 600;
}


/* Badge Avatar */
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
  .search-section {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .user-card {
    padding: 20px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 20px;
  }
}
</style>
