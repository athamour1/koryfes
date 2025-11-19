<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">My Badges</div>
    <div v-if="authStore.user && authStore.user.badges && authStore.user.badges.length > 0" class="row q-col-gutter-md">
      <div v-for="badge in authStore.user.badges" :key="badge.id" class="col-12 col-sm-6 col-md-4">
        <q-card>
          <q-img :src="badge.image || 'https://cdn.quasar.dev/img/parallax2.jpg'" style="height: 150px">
            <div class="absolute-bottom text-h6">
              {{ badge.name }}
            </div>
          </q-img>
          <q-card-section>
            {{ badge.description }}
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div v-else>
      <p>You have no badges yet.</p>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.fetchProfile();
});
</script>
