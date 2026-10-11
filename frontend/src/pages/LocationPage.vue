<template>
  <!-- Σελίδα τοπικού: οι ενωμοτίες του, για κάθε συνδεδεμένο χρήστη (μόνο ανάγνωση) -->
  <q-page class="tf-page">
    <!-- σκελετός με το σχήμα της σελίδας όσο φορτώνει -->
    <template v-if="loading">
      <div class="q-pt-md q-pb-sm">
        <q-skeleton type="QBtn" width="88px" height="32px" />
      </div>
      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <q-skeleton type="rect" width="88px" height="88px" />
          <div class="col">
            <q-skeleton type="text" width="45%" height="36px" />
            <div class="row q-gutter-xs">
              <q-skeleton v-for="n in 3" :key="n" type="QChip" width="96px" height="24px" />
            </div>
          </div>
        </q-card-section>
      </q-card>
      <q-skeleton type="text" width="120px" class="q-mb-sm" />
      <div class="tf-card-grid" style="--tf-min: 240px">
        <q-card v-for="n in 6" :key="n" flat bordered>
          <q-card-section class="row items-center no-wrap q-gutter-sm">
            <q-skeleton type="rect" width="48px" height="48px" />
            <div class="col">
              <q-skeleton type="text" width="60%" />
              <q-skeleton type="text" width="35%" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template v-else-if="location">
      <div class="q-pt-md q-pb-sm">
        <q-btn flat dense no-caps icon="arrow_back" :label="$t('general.back')" color="primary" @click="$router.back()" />
      </div>

      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <div class="location-icon">
            <q-icon name="place" size="40px" />
          </div>
          <div class="col">
            <h1 class="page-title">{{ location.name }}</h1>
            <div class="row items-center q-gutter-xs">
              <q-chip dense square color="grey-2" text-color="grey-9" icon="flag" class="q-ml-none">
                {{ typeLabel }}
              </q-chip>
              <q-chip dense square color="grey-2" text-color="grey-9" icon="groups">
                {{ $t('locationPage.unitCount', location.units.length) }}
              </q-chip>
              <q-chip dense square color="grey-2" text-color="grey-9" icon="person">
                {{ $t('locationPage.guideCount', location.guideCount) }}
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="tf-card-head"><q-icon name="groups" />{{ $t('locationPage.units') }}</div>
      <div v-if="location.units.length" class="tf-card-grid" style="--tf-min: 240px">
        <q-card
          v-for="unit in location.units"
          :key="unit.id"
          flat
          bordered
          class="cursor-pointer unit-card"
          @click="$router.push(`/units/${unit.id}`)"
        >
          <q-card-section class="row items-center no-wrap q-gutter-sm">
            <div class="unit-flag">
              <img v-if="unit.flag" :src="url(unit.flag)" :alt="unit.name" />
              <q-icon v-else name="flag" size="24px" />
            </div>
            <div class="col">
              <div class="text-weight-bold ellipsis">{{ unit.name }}</div>
              <div class="text-caption text-grey-7">{{ $t('locationPage.memberCount', unit.memberCount) }}</div>
            </div>
            <q-icon name="chevron_right" color="grey-6" class="chevron" />
          </q-card-section>
        </q-card>
      </div>
      <div v-else class="text-caption text-grey-6 q-pa-md">{{ $t('locationPage.noUnits') }}</div>
    </template>

    <div v-else class="column items-center q-pa-xl text-center">
      <div class="tf-tile" style="--tile-size: 64px"><q-icon name="place" size="32px" /></div>
      <div class="section-title q-mt-md">{{ $t('locationPage.notFound') }}</div>
      <q-btn flat no-caps color="primary" icon="arrow_back" :label="$t('general.back')" class="q-mt-sm" @click="$router.back()" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '@/api';
import { config } from '@/config';

const route = useRoute();
const { t } = useI18n();

const location = ref(null);
const loading = ref(true);

const url = (path) => (path?.startsWith('http') ? path : `${config.apiUrl}${path}`);

const typeLabel = computed(() => (location.value?.type === 'naval-guides'
  ? t('locationManagement.types.navalGuides')
  : t('locationManagement.types.guides')));

watch(() => route.params.id, async (id) => {
  if (!id) return;
  loading.value = true;
  location.value = null;
  try {
    location.value = (await api.get(`/locations/${id}/overview`)).data;
  } catch {
    location.value = null;
  } finally {
    loading.value = false;
  }
}, { immediate: true });
</script>

<style scoped>
.location-icon {
  flex: 0 0 auto;
  width: 88px;
  height: 88px;
  border-radius: var(--radius-card);
  display: grid;
  place-items: center;
  color: var(--klados-ink);
  background: color-mix(in srgb, var(--klados-color) 12%, var(--surface));
  border: 1px solid var(--border-soft);
}
.unit-flag {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: var(--klados-ink);
  background: color-mix(in srgb, var(--klados-color) 10%, var(--surface));
}
.unit-flag img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.chevron {
  transition: transform var(--dur-medium) var(--ease-emphasized);
}
.unit-card:hover .chevron {
  transform: translateX(3px);
}
.page-title {
  margin: 0 0 4px;
}
</style>
