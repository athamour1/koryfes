<template>
  <q-page class="tf-page">
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <template v-else-if="unit">
      <div class="q-pt-md q-pb-sm">
        <q-btn flat dense no-caps icon="arrow_back" :label="$t('general.back')" color="primary" @click="$router.back()" />
      </div>

      <!-- Καρτέλα ενωμοτίας -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <div class="unit-flag">
            <img v-if="unit.flag" :src="`${config.apiUrl}${unit.flag}`" :alt="unit.name" />
            <q-icon v-else name="flag" size="40px" />
          </div>
          <div class="col">
            <h1 class="page-title">{{ unit.name }}</h1>
            <q-chip v-if="unit.location" dense square color="grey-2" text-color="grey-9" icon="place" class="q-ml-none">
              {{ unit.location.name }}
            </q-chip>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="tf-card-head"><q-icon name="info" />{{ $t('unitPage.aboutUnit') }}</div>
          <div class="text-body1">{{ unit.description || $t('unitPage.noDescription') }}</div>
        </q-card-section>
      </q-card>

      <!-- Μέλη -->
      <div class="tf-card-head"><q-icon name="groups" />{{ $t('unitPage.members') }}</div>
      <div v-if="unit.users?.length" class="tf-card-grid" style="--tf-min: 240px">
        <q-card
          v-for="member in unit.users"
          :key="member.id"
          flat
          bordered
          class="cursor-pointer"
          @click="$router.push(`/user/${member.id}`)"
        >
          <q-card-section class="row items-center no-wrap q-gutter-sm">
            <div class="member-avatar">
              <AvatarDisplay :config="member.avatarConfig" size="48px" />
            </div>
            <div class="col">
              <div class="text-weight-bold ellipsis">{{ member.username }}</div>
              <div class="text-caption text-grey-7">
                {{ member.role === 'admin' ? $t('unitPage.roles.captain') : $t('unitPage.roles.guide') }}
              </div>
            </div>
            <q-icon name="chevron_right" color="grey-6" />
          </q-card-section>
        </q-card>
      </div>
      <div v-else class="text-caption text-grey-6 q-pa-md">{{ $t('unitPage.noMembers') }}</div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUnitStore } from '@/stores/unit';
import { config } from '@/config';
import AvatarDisplay from '@/components/AvatarDisplay.vue';

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
.unit-flag {
  flex: 0 0 auto;
  width: 88px;
  height: 88px;
  border-radius: var(--radius-card);
  overflow: hidden;
  display: grid;
  place-items: center;
  color: var(--klados-ink);
  background: color-mix(in srgb, var(--klados-color) 12%, var(--surface));
  border: 1px solid var(--border-soft);
}
.unit-flag img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.member-avatar {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--klados-color) 10%, var(--surface));
}
.page-title {
  margin: 0 0 4px;
}
</style>
