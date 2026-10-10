<template>
  <q-page class="tf-page progress-page">
    <PageHeader
      icon="trending_up"
      :title="$t('progress.catalogTitle')"
      :subtitle="$t('progress.catalogSubtitle')"
    />

    <q-banner class="bg-blue-1 q-mb-md" dense>
      <template #avatar><q-icon name="menu_book" color="primary" /></template>
      {{ $t('progress.readOnlyNote') }}
    </q-banner>

    <!-- Ενότητες: segmented control με «χάπι» που γλιστρά + αναζήτηση -->
    <div class="tf-toolbar q-mb-md">
      <SegmentedToggle v-model="tab" :options="tabOptions" />
      <div v-if="tab === 'paths' || tab === 'elective'" class="tf-actions">
        <q-input v-model="search" dense outlined clearable :placeholder="$t('progress.search')" class="search-input">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
    </div>

    <div v-if="!store.loaded" class="flex flex-center q-pa-xl">
      <q-spinner size="40px" color="primary" />
    </div>

    <transition v-else name="tf-page" mode="out-in">
      <!-- Κορυφές -->
      <div v-if="tab === 'peaks'" key="peaks" class="tf-card-grid" style="--tf-min: 240px">
        <q-card v-for="peak in store.peaks" :key="peak.id" flat bordered class="text-center">
          <q-card-section>
            <img :src="peakImage(peak)" :alt="peak.name" class="peak-image" />
            <div class="text-weight-bold q-mt-sm">{{ peak.name }}</div>
            <div class="text-body2 text-grey-7 q-mt-xs">{{ peak.description }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Μονοπάτια ανά κεφάλαιο -->
      <q-list v-else-if="tab === 'paths'" key="paths" bordered separator>
        <q-expansion-item
          v-for="chapter in filteredChapters"
          :key="chapter.category"
          :default-opened="!!search"
          expand-separator
        >
          <template #header>
            <q-item-section avatar>
              <div class="tf-tile"><q-icon :name="CHAPTER_ICON[chapter.category]" size="22px" /></div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t(`progress.chapters.${chapter.category}`) }}</q-item-label>
              <q-item-label caption>{{ chapter.paths.length }} {{ $t('progress.paths') }}</q-item-label>
            </q-item-section>
          </template>
          <q-list dense separator>
            <q-item v-for="p in chapter.paths" :key="p.id">
              <q-item-section avatar class="path-number">{{ p.number }}.</q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ p.name }}</q-item-label>
                <q-item-label caption>{{ p.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>

      <!-- Πτυχία (Οδηγισμού / Κλάδου) -->
      <div v-else :key="tab" class="badge-grid">
        <button
          v-for="d in tab === 'guide' ? store.guideDiplomas : filteredElectives"
          :key="d.id"
          type="button"
          class="badge-tile tf-rise"
          @click="selected = d"
        >
          <img :src="diplomaImage(d)" :alt="d.name" class="badge-tile__img" loading="lazy" />
          <div class="badge-tile__name">
            <span v-if="d.number" class="text-grey-6">{{ d.number }}.</span>
            {{ d.name.replace(/^Πτυχίο /, '') }}
          </div>
        </button>
      </div>
    </transition>

    <!-- Απαιτήσεις πτυχίου -->
    <q-dialog :model-value="!!selected" @update:model-value="selected = null">
      <q-card v-if="selected" style="width: 560px; max-width: 95vw">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <img :src="diplomaImage(selected)" :alt="selected.name" class="dialog-badge" />
          <div class="col">
            <div class="text-h6 text-weight-bold">{{ selected.name }}</div>
            <div class="text-caption text-grey-7">{{ selected.requirements.length }} {{ $t('progress.requirements').toLowerCase() }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="scroll" style="max-height: 60vh">
          <div v-if="selected.intro" class="text-body2 text-italic text-grey-8 q-mb-sm">{{ selected.intro }}</div>
          <q-list dense>
            <q-item v-for="r in selected.requirements" :key="r.n" class="q-px-none">
              <q-item-section avatar class="path-number">{{ r.n }}.</q-item-section>
              <q-item-section>{{ r.text }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProgressStore } from '@/stores/progress';
import { diplomaImage, peakImage } from '@/utils/badges';
import PageHeader from '@/components/PageHeader.vue';
import SegmentedToggle from '@/components/SegmentedToggle.vue';

const store = useProgressStore();
const { t } = useI18n();
const tab = ref('peaks');
const search = ref('');
const selected = ref(null);

const CHAPTER_ICON = {
  me_and_my_capabilities: 'self_improvement',
  society_and_volunteering: 'volunteer_activism',
  nature: 'forest',
  arts: 'palette',
};

const tabOptions = computed(() => [
  { value: 'peaks', label: t('progress.tabs.peaks'), icon: 'terrain', attrs: { 'data-cy': 'tab-peaks' } },
  { value: 'paths', label: `${t('progress.tabs.paths')} · ${store.paths.length}`, icon: 'route', attrs: { 'data-cy': 'tab-paths' } },
  { value: 'guide', label: t('progress.tabs.guideDiplomas'), icon: 'school', attrs: { 'data-cy': 'tab-guide-diplomas' } },
  { value: 'elective', label: `${t('progress.tabs.electiveDiplomas')} · ${store.electiveDiplomas.length}`, icon: 'stars', attrs: { 'data-cy': 'tab-elective-diplomas' } },
]);

watch(tab, () => { search.value = ''; });

const matches = (...fields) => {
  const q = (search.value || '').trim().toLowerCase();
  return !q || fields.some((f) => f?.toLowerCase().includes(q));
};

const filteredChapters = computed(() => store.pathsByChapter
  .map((c) => ({ ...c, paths: c.paths.filter((p) => matches(p.name, p.description)) }))
  .filter((c) => c.paths.length));

const filteredElectives = computed(() => store.electiveDiplomas.filter((d) => matches(d.name)));

onMounted(() => store.fetchCatalog());
</script>

<style scoped>
.peak-image {
  display: block;
  width: 128px;
  height: 128px;
  margin: 0 auto;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(16, 22, 28, 0.16));
  transition: transform var(--dur-medium) var(--ease-emphasized);
}
.q-card:hover .peak-image {
  transform: scale(1.04) rotate(-2deg);
}
.path-number {
  min-width: 34px;
  font-weight: 700;
  color: var(--klados-ink);
}
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
}
.badge-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: center;
  padding: 14px 8px 10px;
  border-radius: var(--radius-card);
  border: 1px solid var(--border-soft);
  background: var(--surface);
  box-shadow: var(--shadow-1);
  transition: box-shadow 180ms ease, transform 180ms ease;
}
.badge-tile:hover {
  box-shadow: var(--shadow-2);
  transform: translateY(-2px);
}
.badge-tile:active {
  transform: scale(0.97);
  transition-duration: 60ms;
}
.badge-tile__img {
  display: block;
  width: 84px;
  height: 84px;
  margin: 0 auto 8px;
  object-fit: contain;
  transition: transform var(--dur-medium) var(--ease-emphasized);
}
.badge-tile:hover .badge-tile__img {
  transform: scale(1.06);
}
.badge-tile__name {
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.25;
}
.dialog-badge {
  width: 72px;
  height: 72px;
  object-fit: contain;
}
</style>
