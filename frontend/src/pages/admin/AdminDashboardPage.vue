<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <PageHeader 
      :title="$t('dashboard.welcome', { name: stats.userName })"
      :subtitle="$t('dashboard.subtitle')"
    />

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3" v-for="(stat, index) in mainStats" :key="index">
        <q-card flat bordered :data-cy="'stat-card-' + index">
          <q-card-section class="text-center">
            <q-icon :name="stat.icon" size="48px" class="q-mb-sm" color="primary" />
            <div class="text-h3 text-weight-bold" :data-cy="'stat-value-' + index">{{ stat.value }}</div>
            <div class="text-subtitle2" :data-cy="'stat-label-' + index">{{ stat.label }}</div>
            <q-chip dense :icon="stat.trend === 'up' ? 'trending_up' : 'trending_flat'" 
                    :color="stat.trend === 'up' ? 'positive' : 'grey'" 
                    text-color="white" size="sm" class="q-mt-sm">
              {{ stat.change }}
            </q-chip>
          </q-card-section>
        </q-card>
      </div>
    </div>

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
              <q-item clickable v-ripple @click="$router.push('/admin/users')" class="q-pa-md" data-cy="quick-action-add-guide">
                <q-item-section avatar>
                  <q-avatar size="48px" class="gradient-purple text-white">
                    <q-icon name="person_add" size="24px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ $t('dashboard.quickActions.addGuide') }}</q-item-label>
                  <q-item-label caption>{{ $t('dashboard.quickActions.addGuideCaption') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="$router.push('/admin/progress')" class="q-pa-md" data-cy="quick-action-manage-progress">
                <q-item-section avatar>
                  <q-avatar size="48px" class="gradient-pink text-white">
                    <q-icon name="emoji_events" size="24px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ $t('dashboard.quickActions.manageProgress') }}</q-item-label>
                  <q-item-label caption>{{ $t('dashboard.quickActions.manageProgressCaption') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="$router.push('/admin/locations')" class="q-pa-md" data-cy="quick-action-manage-locations">
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

        <!-- Top Guides -->
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">
                  <q-icon name="stars" size="24px" class="q-mr-sm" />
                  {{ $t('dashboard.topGuides.title') }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip color="primary" text-color="white" dense>{{ $t('dashboard.topGuides.thisMonth') }}</q-chip>
              </div>
            </div>

            <q-list separator>
              <q-item v-for="(guide, index) in topGuides" :key="guide.id" class="q-pa-sm">
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
                    <img :src="getAvatarUrl(guide.username)" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ guide.username }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="place" size="14px" />
                    {{ guide.location?.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip dense color="amber" text-color="white" icon="military_tech">
                    {{ getTotalDiplomas(guide) }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column -->
      <div class="col-12 col-md-6">
        <!-- Progress Distribution -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="pie_chart" size="24px" class="q-mr-sm" />
              {{ $t('dashboard.progress.title') }}
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
              <div class="text-caption">{{ $t('dashboard.progress.completion') }}</div>
            </div>

            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="circle" color="primary" size="12px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('dashboard.stats.totalDiplomas') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold">{{ stats.totalDiplomas }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="circle" color="pink" size="12px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('dashboard.stats.pathsCompleted') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold">{{ stats.pathsCompleted }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="circle" color="green" size="12px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('dashboard.stats.peaksReached') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold">{{ stats.peaksReached }}</q-item-label>
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
                    <q-item-section>{{ $t('dashboard.locations.guidesCount', { count: location.userCount }) }}</q-item-section>
                  </q-item>
                  <q-item dense class="q-px-none">
                    <q-item-section avatar>
                      <q-icon name="emoji_events" />
                    </q-item-section>
                    <q-item-section>{{ $t('dashboard.locations.diplomasCount', { count: location.diplomaCount }) }}</q-item-section>
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
import { useAuthStore } from 'src/stores/auth';
import { api } from 'src/api';
import { getAvatarUrl } from 'src/utils/avatar';
import PageHeader from 'src/components/PageHeader.vue';

const authStore = useAuthStore();
const { t } = useI18n();

const stats = ref({
  userName: authStore.user?.username || 'Admin',
  totalUsers: 0,
  totalDiplomas: 0,
  pathsCompleted: 0,
  peaksReached: 0,
  activeLocations: 0
});

const topGuides = ref([]);
const locationStats = ref([]);
const recentActivity = ref([
  { icon: 'person_add', text: 'New guide joined TT Megarwn', time: '2 hours ago' },
  { icon: 'emoji_events', text: 'Diploma earned by user_eleysinas_5', time: '5 hours ago' },
  { icon: 'military_tech', text: '12 guides completed paths', time: 'Yesterday' },
  { icon: 'location_on', text: 'TT Salaminas updated', time: '2 days ago' },
]);

const mainStats = computed(() => [
  {
    icon: 'people',
    label: t('dashboard.stats.totalGuides'),
    value: stats.value.totalUsers,
    change: '+12%',
    trend: 'up'
  },
  {
    icon: 'workspace_premium',
    label: t('dashboard.stats.totalDiplomas'),
    value: stats.value.totalDiplomas,
    change: '+5%',
    trend: 'up'
  },
  {
    icon: 'emoji_events',
    label: t('dashboard.stats.pathsCompleted'),
    value: stats.value.pathsCompleted,
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
  if (!stats.value.totalUsers) return 0;
  const totalPossible = stats.value.totalUsers * 20; // Assume avg 20 diplomas available
  if (totalPossible === 0) return 0;
  return Math.round((stats.value.totalDiplomas / totalPossible) * 100);
});

const getTotalDiplomas = (user) => {
  if (!user.progress) return 0;
  const guideCount = user.progress.guideDiplomas?.length || 0;
  const electiveCount = user.progress.electiveDiplomas?.length || 0;
  return guideCount + electiveCount;
};

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
    
    // Calculate progress stats
    stats.value.totalDiplomas = users.reduce((sum, user) => {
      if (!user.progress) return sum;
      const guideCount = user.progress.guideDiplomas?.length || 0;
      const electiveCount = user.progress.electiveDiplomas?.length || 0;
      return sum + guideCount + electiveCount;
    }, 0);
    
    stats.value.pathsCompleted = users.reduce((sum, user) => {
      return sum + (user.progress?.completedPaths?.length || 0);
    }, 0);
    
    stats.value.peaksReached = users.filter(u => u.progress?.currentPeak).length;
    
    // Fetch locations
    const locationsRes = await api.get('/locations');
    const locations = locationsRes.data;
    stats.value.activeLocations = locations.length;
    
    // Top guides (users with most diplomas)
    topGuides.value = users
      .filter(u => u.role === 'user')
      .sort((a, b) => getTotalDiplomas(b) - getTotalDiplomas(a))
      .slice(0, 5);
    
    // Location stats
    locationStats.value = locations.map(loc => {
      const locationUsers = users.filter(u => u.location?.id === loc.id && u.role === 'user');
      const locationDiplomas = locationUsers.reduce((sum, u) => sum + getTotalDiplomas(u), 0);
      return {
        id: loc.id,
        name: loc.name,
        userCount: locationUsers.length,
        diplomaCount: locationDiplomas,
        progress: locationUsers.length > 0 ? Math.round((locationDiplomas / (locationUsers.length * 20)) * 100) : 0
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
