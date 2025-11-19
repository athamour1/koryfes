<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">My Badges</div>

    <div v-if="userBadges.length === 0" class="text-center q-pa-xl">
      <q-icon name="emoji_events" size="80px" color="grey-5" />
      <div class="text-h6 text-grey q-mt-md">You have no badges yet.</div>
      <div class="text-caption text-grey">Complete activities to earn badges!</div>
    </div>

    <div v-else>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="badge in userBadges" :key="badge.id">
          <q-card>
            <q-card-section class="text-center">
              <q-avatar size="100px" style="border-radius: 12px">
                <img v-if="badge.image" :src="`${config.apiUrl}${badge.image}`" style="object-fit: cover; border-radius: 12px" />
                <q-icon v-else name="star" color="primary" size="80px" />
              </q-avatar>
              
              <div class="q-mt-md">
                <div class="text-h6">
                  {{ badge.name }}
                  <q-icon name="check_circle" color="positive" size="sm" class="q-ml-xs" />
                </div>
                <div class="text-caption text-grey-7">
                  {{ badge.description }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="q-mt-xl">
        <q-separator class="q-mb-md" />
        <div class="text-h6 q-mb-md">
          <q-icon name="emoji_events" color="positive" size="sm" class="q-mr-sm" />
          You have earned {{ userBadges.length }} badge{{ userBadges.length !== 1 ? 's' : '' }}!
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { config } from '../config';

const authStore = useAuthStore();
const userBadges = ref([]);

onMounted(async () => {
  await authStore.fetchProfile();
  userBadges.value = authStore.user?.badges || [];
});
</script>
