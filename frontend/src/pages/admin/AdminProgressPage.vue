<template>
  <q-page class="progress-page">
    <PageHeader
      icon="trending_up"
      :title="$t('progress.catalogTitle')"
      :subtitle="$t('progress.catalogSubtitle')"
    />

    <div class="q-pa-md" style="max-width: 1400px; margin: 0 auto;">
      <q-banner rounded class="bg-blue-1 text-blue-10 q-mb-md" dense>
        <template #avatar><q-icon name="menu_book" color="primary" /></template>
        {{ $t('progress.readOnlyNote') }}
      </q-banner>

      <q-card flat bordered>
        <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
          <q-tab name="peaks" icon="landscape" :label="$t('progress.tabs.peaks')" data-cy="tab-peaks" />
          <q-tab name="paths" icon="route" :label="`${$t('progress.tabs.paths')} (${store.paths.length})`" data-cy="tab-paths" />
          <q-tab name="guide" icon="school" :label="$t('progress.tabs.guideDiplomas')" data-cy="tab-guide-diplomas" />
          <q-tab name="elective" icon="stars" :label="`${$t('progress.tabs.electiveDiplomas')} (${store.electiveDiplomas.length})`" data-cy="tab-elective-diplomas" />
        </q-tabs>
        <q-separator />

        <div v-if="!store.loaded" class="flex flex-center q-pa-xl">
          <q-spinner size="40px" color="primary" />
        </div>

        <q-tab-panels v-else v-model="tab" animated>
          <!-- Peaks -->
          <q-tab-panel name="peaks">
            <div class="row q-col-gutter-lg">
              <div v-for="peak in store.peaks" :key="peak.id" class="col-12 col-sm-6 col-md-3">
                <q-card flat bordered class="text-center full-height q-pa-md">
                  <img :src="peakImage(peak)" :alt="peak.name" class="peak-image" />
                  <div class="text-h6 q-mt-sm">{{ peak.name }}</div>
                  <div class="text-body2 text-grey-8 q-mt-sm">{{ peak.description }}</div>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Paths -->
          <q-tab-panel name="paths">
            <q-input v-model="search" dense filled clearable :label="$t('progress.search')" class="q-mb-md">
              <template #prepend><q-icon name="search" /></template>
            </q-input>
            <q-list bordered separator class="rounded-borders">
              <q-expansion-item
                v-for="chapter in filteredChapters"
                :key="chapter.category"
                :label="$t(`progress.chapters.${chapter.category}`)"
                :caption="`${chapter.paths.length} ${$t('progress.paths')}`"
                :default-opened="!!search"
                header-class="text-weight-medium"
              >
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
          </q-tab-panel>

          <!-- Guiding diplomas -->
          <q-tab-panel name="guide">
            <div class="diploma-grid">
              <div v-for="d in store.guideDiplomas" :key="d.id" class="diploma-card" @click="selected = d">
                <img :src="diplomaImage(d)" :alt="d.name" />
                <div>{{ d.name }}</div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Branch diplomas -->
          <q-tab-panel name="elective">
            <q-input v-model="search" dense filled clearable :label="$t('progress.search')" class="q-mb-md">
              <template #prepend><q-icon name="search" /></template>
            </q-input>
            <div class="diploma-grid">
              <div v-for="d in filteredElectives" :key="d.id" class="diploma-card" @click="selected = d">
                <img :src="diplomaImage(d)" :alt="d.name" loading="lazy" />
                <div><span class="text-grey-6">{{ d.number }}.</span> {{ d.name.replace(/^Πτυχίο /, '') }}</div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <!-- Diploma requirements -->
    <q-dialog :model-value="!!selected" @update:model-value="selected = null">
      <q-card v-if="selected" style="width: 560px; max-width: 95vw">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <img :src="diplomaImage(selected)" :alt="selected.name" style="width: 80px; height: 80px" />
          <div class="text-h6">{{ selected.name }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="selected.intro" class="text-body2 text-italic q-mb-sm">{{ selected.intro }}</div>
          <div class="text-subtitle2 q-mb-xs">{{ $t('progress.requirements') }}</div>
          <ol class="requirements">
            <li v-for="r in selected.requirements" :key="r.n" :value="r.n">{{ r.text }}</li>
          </ol>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('general.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useProgressStore } from '@/stores/progress';
import { diplomaImage, peakImage } from '@/utils/badges';
import PageHeader from '@/components/PageHeader.vue';

const store = useProgressStore();
const tab = ref('peaks');
const search = ref('');
const selected = ref(null);

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
  width: 140px;
  height: 140px;
  object-fit: contain;
}
.path-number {
  min-width: 36px;
  font-weight: 600;
  color: var(--q-primary);
}
.diploma-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 16px;
}
.diploma-card {
  text-align: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background 0.15s;
  font-size: 0.85rem;
  line-height: 1.25;
}
.diploma-card:hover {
  background: rgba(128, 128, 128, 0.12);
}
.diploma-card img {
  width: 96px;
  height: 96px;
  object-fit: contain;
  display: block;
  margin: 0 auto 6px;
}
.requirements {
  padding-left: 1.4em;
  margin: 0;
}
.requirements li {
  margin-bottom: 6px;
}
</style>
