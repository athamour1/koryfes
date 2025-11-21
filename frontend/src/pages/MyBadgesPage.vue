<template>
  <q-page class="badges-page">
    <!-- Hero Header -->
    <div class="gradient-purple text-white q-pa-xl" style="position: relative; overflow: hidden;">
      <div class="absolute-full" style="background-image: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);"></div>
      
      <div class="relative-position text-center q-pa-md" style="max-width: 800px; margin: 0 auto;">
        <div class="text-h3 text-weight-bold q-mb-sm">
          <q-icon name="emoji_events" size="48px" class="q-mr-sm" />
          My Badges
        </div>
        <div class="text-h6 text-weight-light" style="opacity: 0.9;">
          Your achievements and earned badges
        </div>
        
        <!-- Badge Count -->
        <div class="q-mt-lg">
          <q-chip 
            size="lg" 
            class="text-weight-bold" 
            style="background: rgba(255, 255, 255, 0.2); color: white; backdrop-filter: blur(10px);"
          >
            <q-icon name="military_tech" size="24px" class="q-mr-xs" />
            {{ userBadges.length }} Badge{{ userBadges.length !== 1 ? 's' : '' }} Earned
          </q-chip>
        </div>
      </div>
    </div>

    <!-- Badges Content -->
    <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto;">
      <!-- Empty State -->
      <div v-if="userBadges.length === 0" class="text-center q-pa-xl">
        <q-icon name="emoji_events" size="120px" color="grey-5" />
        <div class="text-h5 text-weight-medium text-grey-7 q-mt-md">No badges yet</div>
        <div class="text-body1 text-grey-6 q-mt-sm">Complete activities to earn badges!</div>
      </div>

      <!-- Badges Grid -->
      <div v-else>
        <div class="row q-col-gutter-lg">
          <div 
            class="col-12 col-sm-6 col-md-4 col-lg-3" 
            v-for="badge in userBadges" 
            :key="badge.id"
          >
            <q-card class="badge-card full-height" flat bordered>
              <q-card-section class="text-center q-pa-lg">
                <!-- Badge Image -->
                <div class="badge-image-wrapper q-mb-md">
                  <q-avatar 
                    size="120px" 
                    class="badge-avatar"
                  >
                    <img 
                      v-if="badge.image" 
                      :src="`${config.apiUrl}${badge.image}`" 
                      style="object-fit: cover" 
                    />
                    <q-icon v-else name="star" color="primary" size="80px" />
                  </q-avatar>
                  
                  <!-- Achievement Checkmark -->
                  <q-icon 
                    name="check_circle" 
                    color="positive" 
                    size="32px" 
                    class="absolute achievement-check"
                    style="bottom: 0; right: calc(50% - 70px); background: white; border-radius: 50%;"
                  />
                </div>
                
                <!-- Badge Info -->
                <div class="q-mt-md">
                  <div class="text-h6 text-weight-bold q-mb-xs">
                    {{ badge.name }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    {{ badge.description }}
                  </div>
                </div>
              </q-card-section>
              
              <!-- Badge Footer -->
              <q-card-section class="q-pt-none text-center">
                <q-separator class="q-mb-md" />
                <div class="text-caption text-grey-6">
                  <q-icon name="verified" size="16px" class="q-mr-xs" />
                  Earned {{ badge.acquiredAt ? 'on ' + formatDate(badge.acquiredAt) : '' }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Summary Card -->
        <q-card class="q-mt-xl gradient-purple text-white" flat>
          <q-card-section class="text-center q-pa-lg">
            <div class="text-h5 text-weight-bold q-mb-sm">
              <q-icon name="emoji_events" color="white" size="32px" class="q-mr-sm" />
              Congratulations!
            </div>
            <div class="text-h6 text-weight-light" style="opacity: 0.9;">
              You have earned {{ userBadges.length }} badge{{ userBadges.length !== 1 ? 's' : '' }}!
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { config } from '../config';
import { date } from 'quasar';

const authStore = useAuthStore();
const userBadges = ref([]);

onMounted(async () => {
  await authStore.fetchProfile();
  userBadges.value = authStore.user?.badges || [];
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return date.formatDate(dateString, 'MMM D, YYYY');
};
</script>

<style scoped>
.badges-page {
  min-height: 100vh;
}

.badge-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.badge-card:hover {
  transform: translateY(-8px);
}

.badge-image-wrapper {
  position: relative;
  display: inline-block;
}

.achievement-check {
  animation: checkPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes checkPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Dark mode adjustments */
body.body--dark .badge-card {
  border-color: rgba(255, 255, 255, 0.12);
}

body.body--dark .achievement-check {
  background: var(--q-dark);
}
</style>
