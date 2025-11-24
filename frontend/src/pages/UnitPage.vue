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
          <div class="text-h6">{{ $t('unitPage.aboutUnit') }}</div>
          <div class="text-body1">{{ unit.description || $t('unitPage.noDescription') }}</div>
        </q-card-section>
      </q-card>

      <!-- Members -->
      <div class="text-h5 q-mb-md">{{ $t('unitPage.members') }}</div>
      <div class="row q-col-gutter-md">
        <div v-for="member in unit.users" :key="member.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card class="cursor-pointer hover-effect" @click="$router.push(`/user/${member.id}`)">
            <q-card-section class="row items-center">
              <q-avatar size="50px" class="q-mr-md">
                <img v-if="member.profileImage" :src="member.profileImage" style="object-fit: cover" />
                <q-icon v-else name="person" color="grey" />
              </q-avatar>
              <div>
                <div class="text-subtitle1">{{ member.username }}</div>
              </div>
            </q-card-section>

            <!-- Unit & Role Card -->
            <div class="unit-role-card q-mx-md q-mb-md">
              <div class="unit-section">
                <div class="text-caption text-grey-7">{{ $t('unitPage.unitLabel') || 'Unit' }}</div>
                <div class="text-weight-bold">{{ unit.name }}</div>
              </div>
              <div class="unit-divider"></div>
              <div class="role-section">
                <div class="text-caption text-grey-7">{{ $t('unitPage.roleLabel') || 'Role' }}</div>
                <div class="text-weight-bold">{{ member.role === 'admin' ? $t('unitPage.roles.captain') : $t('unitPage.roles.scout') }}</div>
              </div>
            </div>
          </q-card>
        </div>
        <div v-if="!unit.users || unit.users.length === 0" class="col-12 text-grey text-center q-pa-lg">
          {{ $t('unitPage.noMembers') }}
        </div>
      </div>
    </div>

    <div v-else class="text-center q-pa-lg">
      <div class="text-h5 text-negative">{{ $t('unitPage.notFound') }}</div>
      <q-btn :label="$t('unitPage.goBack')" color="primary" flat @click="$router.go(-1)" class="q-mt-md" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUnitStore } from 'src/stores/unit';
import { config } from 'src/config';

const route = useRoute();
const unitStore = useUnitStore();
const { t } = useI18n();

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

.unit-role-card {
  display: flex;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

body.body--dark .unit-role-card {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.unit-section,
.role-section {
  flex: 1;
  padding: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.unit-divider {
  width: 1px;
  background: rgba(0, 0, 0, 0.1);
}

body.body--dark .unit-divider {
  background: rgba(255, 255, 255, 0.1);
}
</style>
