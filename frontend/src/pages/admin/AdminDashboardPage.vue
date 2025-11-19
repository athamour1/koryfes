<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Admin Dashboard</div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 text-grey-7">Total Users</div>
            <div class="text-h3 text-primary q-mt-sm">{{ stats.totalUsers }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 text-grey-7">Total Badges</div>
            <div class="text-h3 text-secondary q-mt-sm">{{ stats.totalBadges }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 text-grey-7">Badges Awarded</div>
            <div class="text-h3 text-positive q-mt-sm">{{ stats.totalBadgesAwarded }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 text-grey-7">Avg Badges/User</div>
            <div class="text-h3 text-info q-mt-sm">{{ stats.avgBadgesPerUser }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Top Users and Recent Activity -->
    <div class="row q-col-gutter-md">
      <!-- Top Users by Badges -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Top Users by Badges</div>
          </q-card-section>
          <q-separator />
          <q-list>
            <q-item v-for="user in stats.topUsers" :key="user.id">
              <q-item-section avatar>
                <q-avatar size="40px">
                  <img :src="getAvatarUrl(user.username, user.profileImage)" style="object-fit: cover" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ user.username }}</q-item-label>
                <q-item-label caption>{{ user.location || 'No location' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="primary" :label="`${user.badgeCount} badges`" />
              </q-item-section>
            </q-item>
            <q-item v-if="stats.topUsers.length === 0">
              <q-item-section>
                <q-item-label class="text-grey-6">No users yet</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Badge Distribution -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Badge Distribution</div>
          </q-card-section>
          <q-separator />
          <q-list>
            <q-item v-for="badge in stats.badgeDistribution" :key="badge.id">
              <q-item-section avatar>
                <q-avatar size="40px" style="border-radius: 8px">
                  <img v-if="badge.image" :src="`${config.apiUrl}${badge.image}`" style="object-fit: cover; border-radius: 8px" />
                  <q-icon v-else name="star" color="primary" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ badge.name }}</q-item-label>
                <q-item-label caption>{{ badge.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="secondary" :label="`${badge.awardedCount} awarded`" />
              </q-item-section>
            </q-item>
            <q-item v-if="stats.badgeDistribution.length === 0">
              <q-item-section>
                <q-item-label class="text-grey-6">No badges yet</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../api';
import { config } from '../../config';
import { getAvatarUrl } from '../../utils/avatar';

const stats = ref({
  totalUsers: 0,
  totalBadges: 0,
  totalBadgesAwarded: 0,
  avgBadgesPerUser: 0,
  topUsers: [],
  badgeDistribution: [],
});

onMounted(async () => {
  try {
    const response = await api.get('/admin/stats');
    stats.value = response.data;
  } catch (error) {
    console.error('Failed to fetch stats', error);
  }
});
</script>

<style scoped>
.stat-card {
  height: 100%;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}
</style>
