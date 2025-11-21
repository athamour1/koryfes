<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="unit" class="q-pa-md">
      <!-- Unit Header -->
      <div class="row items-center q-mb-lg">
        <q-avatar size="100px" class="q-mr-md shadow-3">
          <img v-if="unit.flag" :src="`${config.apiUrl}${unit.flag}`" style="object-fit: cover" />
          <q-icon v-else name="flag" color="primary" size="60px" />
        </q-avatar>
        <div>
          <div class="text-h3">{{ unit.name }}</div>
          <div class="text-subtitle1 text-grey">{{ unit.location?.name }}</div>
        </div>
      </div>

      <!-- Description -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6">About Unit</div>
          <div class="text-body1">{{ unit.description || 'No description available.' }}</div>
        </q-card-section>
      </q-card>

      <!-- Members -->
      <div class="text-h5 q-mb-md">Members</div>
      <div class="row q-col-gutter-md">
        <div v-for="member in unit.users" :key="member.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card class="cursor-pointer hover-effect" @click="$router.push(`/profile/${member.id}`)">
            <q-card-section class="row items-center">
              <q-avatar size="50px" class="q-mr-md">
                <img v-if="member.profileImage" :src="member.profileImage" style="object-fit: cover" />
                <q-icon v-else name="person" color="grey" />
              </q-avatar>
              <div>
                <div class="text-subtitle1">{{ member.username }}</div>
                <div class="text-caption text-grey">{{ member.role === 'admin' ? 'Captain' : 'Scout' }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div v-if="!unit.users || unit.users.length === 0" class="col-12 text-grey text-center q-pa-lg">
          No members in this unit yet.
        </div>
      </div>
    </div>

    <div v-else class="text-center q-pa-lg">
      <div class="text-h5 text-negative">Unit not found</div>
      <q-btn label="Go Back" color="primary" flat @click="$router.go(-1)" class="q-mt-md" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUnitStore } from '../stores/unit';
import { config } from '../config';

const route = useRoute();
const unitStore = useUnitStore();

const unit = computed(() => unitStore.currentUnit);
const loading = computed(() => unitStore.loading);

onMounted(async () => {
  const unitId = route.params.id;
  if (unitId) {
    await unitStore.fetchUnit(unitId);
  }
});
</script>

<style scoped>
.hover-effect {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
