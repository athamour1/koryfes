<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <q-card class="gradient-purple text-white q-mb-lg" flat>
      <q-card-section class="q-pa-xl">
        <div class="text-center">
          <div class="text-h3 text-weight-bold q-mb-sm">
            <span class="wave">👋</span>
            {{ $t('dashboard.welcome', { name: stats.userName }) }}
          </div>
          <div class="text-h6 text-weight-light" style="opacity: 0.9;">
            {{ $t('dashboard.subtitle') }}
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row q-col-gutter-md q-mt-lg">
          <div class="col-12 col-sm-6 col-md-3" v-for="(stat, index) in mainStats" :key="index">
            <q-card flat class="text-white" style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px);">
              <q-card-section class="text-center">
                <q-icon :name="stat.icon" size="48px" class="q-mb-sm" />
                <div class="text-h3 text-weight-bold">{{ stat.value }}</div>
                <div class="text-subtitle2">{{ stat.label }}</div>
                <q-chip dense :icon="stat.trend === 'up' ? 'trending_up' : 'trending_flat'" 
                        :color="stat.trend === 'up' ? 'positive' : 'grey'" 
                        text-color="white" size="sm" class="q-mt-sm">
                  {{ stat.change }}
                </q-chip>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Main Content -->
    <div class="row q-col-gutter-md">
      <!-- Left Column -->
      <div class="col-12 col-md-6">
        <!-- Quick Actions -->
        <q-card class="q-mb-md" flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="bolt" size="24px" class="q-mr-sm" />
              {{ $t('dashboard.quickActions.title') }}
            </div>
            <q-list separator>
              <q-item clickable v-ripple @click="$router.push('/admin/users')" class="q-pa-md">
                <q-item-section avatar>
                  <q-avatar size="48px" class="gradient-purple text-white">
                    <q-icon name="person_add" size="24px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ $t('dashboard.quickActions.addScout') }}</q-item-label>
                  <q-item-label caption>{{ $t('dashboard.quickActions.addScoutCaption') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="$router.push('/admin/badges')" class="q-pa-md">
                <q-item-section avatar>
                  <q-avatar size="48px" class="gradient-pink text-white">
                    <q-icon name="emoji_events" size="24px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ $t('dashboard.quickActions.awardBadge') }}</q-item-label>
                  <q-item-label caption>{{ $t('dashboard.quickActions.awardBadgeCaption') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="$router.push('/admin/locations')" class="q-pa-md">
                <q-item-section avatar>
                  <q-avatar size="48px" class="gradient-blue text-white">
                    <q-icon name="location_on" size="24px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ $t('dashboard.quickActions.manageLocations') }}</q-item-label>
                  <q-item-label caption>{{ $t('dashboard.quickActions.manageLocationsCaption') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Top Scouts -->
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">
                  <q-icon name="stars" size="24px" class="q-mr-sm" />
                  {{ $t('dashboard.topScouts.title') }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip color="primary" text-color="white" dense>{{ $t('dashboard.topScouts.thisMonth') }}</q-chip>
              </div>
            </div>

            <q-list separator>
              <q-item v-for="(scout, index) in topScouts" :key="scout.id" class="q-pa-sm">
                <q-item-section avatar>
                  <q-avatar size="40px">
                    <span v-if="index === 0" class="text-h6">🥇</span>
                    <span v-else-if="index === 1" class="text-h6">🥈</span>
                    <span v-else-if="index === 2" class="text-h6">🥉</span>
                    <span v-else class="text-weight-bold">{{ index + 1 }}</span>
                  </q-avatar>
                </q-item-section>
                <q-item-section avatar>
                  <q-avatar size="40px">
                    <img :src="getAvatarUrl(scout.username, scout.profileImage)" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ scout.username }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="place" size="14px" />
                    {{ scout.location?.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip dense color="amber" text-color="white" icon="military_tech">
                    {{ scout.badges?.length || 0 }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column -->
      <div class="col-12 col-md-6">
        <!-- Badge Distribution -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="pie_chart" size="24px" class="q-mr-sm" />
              {{ $t('dashboard.distribution.title') }}
            </div>

            <div class="text-center q-mb-md">
              <q-circular-progress
                :value="achievementPercentage"
                size="150px"
                :thickness="0.15"
                color="primary"
                track-color="grey-3"
                class="q-ma-md"
                show-value
              >
                <div class="text-h4 text-weight-bold text-primary">{{ achievementPercentage }}%</div>
              </q-circular-progress>
              <div class="text-caption">{{ $t('dashboard.distribution.awarded') }}</div>
            </div>

            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="circle" color="primary" size="12px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('dashboard.stats.totalBadges') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold">{{ stats.totalBadges }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="circle" color="pink" size="12px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('dashboard.distribution.awarded') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold">{{ stats.awardedBadges }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="circle" color="grey-5" size="12px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('dashboard.distribution.available') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold">{{ stats.totalBadges - stats.awardedBadges }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Recent Activity -->
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="history" size="24px" class="q-mr-sm" />
              {{ $t('dashboard.activity.title') }}
            </div>

            <q-timeline color="primary">
              <q-timeline-entry
                v-for="(activity, index) in recentActivity"
                :key="index"
                :icon="activity.icon"
                :color="getActivityColor(activity.icon)"
              >
                <template v-slot:subtitle>
                  {{ activity.time }}
                </template>
                {{ activity.text }}
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Locations Overview -->
    <q-card class="q-mt-lg" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="public" size="24px" class="q-mr-sm" />
          {{ $t('dashboard.locations.title') }}
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3" v-for="location in locationStats" :key="location.id">
            <q-card flat class="gradient-purple text-white">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="location_city" size="32px" class="q-mr-sm" />
                  <div class="text-h6 text-weight-bold">{{ location.name }}</div>
                </div>

                <q-list dense dark>
                  <q-item dense class="q-px-none">
                    <q-item-section avatar>
                      <q-icon name="people" />
                    </q-item-section>
                    <q-item-section>{{ $t('dashboard.locations.scoutsCount', { count: location.userCount }) }}</q-item-section>
                  </q-item>
                  <q-item dense class="q-px-none">
                    <q-item-section avatar>
                      <q-icon name="emoji_events" />
                    </q-item-section>
                    <q-item-section>{{ $t('dashboard.locations.badgesCount', { count: location.badgeCount }) }}</q-item-section>
                  </q-item>
                </q-list>

                <q-linear-progress
                  :value="location.progress / 100"
                  color="white"
                  class="q-mt-md"
                  size="8px"
                  rounded
                />
                <div class="text-caption q-mt-xs">{{ $t('dashboard.locations.activePercent', { percent: location.progress }) }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth';
import { api } from '../../api';
import { getAvatarUrl } from '../../utils/avatar';

const authStore = useAuthStore();
const { t } = useI18n();

const stats = ref({
  userName: authStore.user?.username || 'Admin',
  totalUsers: 0,
  totalBadges: 0,
  awardedBadges: 0,
  activeLocations: 0
});

const topScouts = ref([]);
const locationStats = ref([]);
const recentActivity = ref([
  { icon: 'person_add', text: 'New scout joined TT Megarwn', time: '2 hours ago' },
  { icon: 'emoji_events', text: 'Badge awarded to user_eleysinas_5', time: '5 hours ago' },
  { icon: 'military_tech', text: '12 scouts earned new badges', time: 'Yesterday' },
  { icon: 'location_on', text: 'TT Salaminas updated', time: '2 days ago' },
]);

const mainStats = computed(() => [
  {
    icon: 'people',
    label: t('dashboard.stats.totalScouts'),
    value: stats.value.totalUsers,
    change: '+12%',
    trend: 'up'
  },
  {
    icon: 'workspace_premium',
    label: t('dashboard.stats.totalBadges'),
    value: stats.value.totalBadges,
    change: '+5%',
    trend: 'up'
  },
  {
    icon: 'emoji_events',
    label: t('dashboard.stats.badgesAwarded'),
    value: stats.value.awardedBadges,
    change: '+24%',
    trend: 'up'
  },
  {
    icon: 'location_on',
    label: t('dashboard.stats.activeLocations'),
    value: stats.value.activeLocations,
    change: '0%',
    trend: 'flat'
  }
]);

const achievementPercentage = computed(() => {
  if (!stats.value.totalBadges) return 0;
  const totalPossible = stats.value.totalUsers * stats.value.totalBadges;
  if (totalPossible === 0) return 0;
  return Math.round((stats.value.awardedBadges / totalPossible) * 100);
});

const getActivityColor = (icon) => {
  const colorMap = {
    'person_add': 'purple',
    'emoji_events': 'pink',
    'military_tech': 'blue',
    'location_on': 'green'
  };
  return colorMap[icon] || 'primary';
};

const fetchDashboardData = async () => {
  try {
    // Fetch users
    const usersRes = await api.get('/users');
    const users = usersRes.data;
    stats.value.totalUsers = users.filter(u => u.role === 'user').length;
    
    // Fetch badges
    const badgesRes = await api.get('/badges');
    stats.value.totalBadges = badgesRes.data.length;
    
    // Calculate awarded badges
    stats.value.awardedBadges = users.reduce((sum, user) => sum + (user.badges?.length || 0), 0);
    
    // Fetch locations
    const locationsRes = await api.get('/locations');
    const locations = locationsRes.data;
    stats.value.activeLocations = locations.length;
    
    // Top scouts (users with most badges)
    topScouts.value = users
      .filter(u => u.role === 'user')
      .sort((a, b) => (b.badges?.length || 0) - (a.badges?.length || 0))
      .slice(0, 5);
    
    // Location stats
    locationStats.value = locations.map(loc => {
      const locationUsers = users.filter(u => u.location?.id === loc.id && u.role === 'user');
      const locationBadges = locationUsers.reduce((sum, u) => sum + (u.badges?.length || 0), 0);
      return {
        id: loc.id,
        name: loc.name,
        userCount: locationUsers.length,
        badgeCount: locationBadges,
        progress: locationUsers.length > 0 ? Math.round((locationBadges / (locationUsers.length * stats.value.totalBadges)) * 100) : 0
      };
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data', error);
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.wave {
  display: inline-block;
  animation: wave-animation 2.5s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave-animation {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
}
</style>
