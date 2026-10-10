<template>
  <div class="progress-overview">
    <!-- Peak + checklist towards the next peak -->
    <div class="row q-col-gutter-lg items-start q-mb-lg">
      <div class="col-12 col-sm-5 col-md-4 text-center">
        <img v-if="currentPeak" :src="peakImage(currentPeak)" :alt="currentPeak.name" class="peak-image" />
        <div v-else class="peak-placeholder">
          <q-icon name="landscape" size="64px" color="grey-5" />
        </div>
        <div class="text-h6 q-mt-sm">{{ currentPeak?.name || $t('progress.noPromise') }}</div>
        <div v-if="editable" class="q-mt-sm">
          <q-btn
            v-if="!currentPeak"
            unelevated
            color="primary"
            icon="handshake"
            :label="$t('progress.givePromise')"
            data-cy="give-promise-btn"
            @click="$emit('promise', true)"
          />
          <q-btn
            v-else
            flat
            dense
            size="sm"
            color="grey-7"
            icon="undo"
            :label="$t('progress.removePromise')"
            @click="$emit('promise', false)"
          />
        </div>
      </div>

      <div v-if="nextPeak" class="col-12 col-sm-7 col-md-8">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ $t('progress.nextPeak', { name: peakName(nextPeak.type) }) }}
        </div>
        <div v-if="!currentPeak" class="text-caption text-grey-7 q-mb-sm">{{ $t('progress.promiseFirst') }}</div>
        <q-list dense class="checklist">
          <q-item v-for="(r, i) in nextPeak.requirements" :key="i" class="q-px-none">
            <q-item-section avatar class="checklist-icon">
              <q-icon :name="r.met ? 'check_circle' : 'radio_button_unchecked'" :color="r.met ? 'positive' : 'grey-5'" />
            </q-item-section>
            <q-item-section>{{ requirementLabel(r, nextPeak.type) }}</q-item-section>
            <q-item-section side v-if="r.required > 1">
              <span :class="r.met ? 'text-positive' : 'text-grey-7'">{{ r.current }}/{{ r.required }}</span>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div v-else-if="evaluation" class="col-12 col-sm-7 col-md-8 self-center text-h6 text-positive">
        <q-icon name="emoji_events" /> {{ $t('progress.allPeaksReached') }}
      </div>
    </div>

    <!-- Diplomas -->
    <div v-for="group in diplomaGroups" :key="group.type" class="q-mb-lg">
      <div class="section-title">
        <span>{{ group.title }} ({{ group.items.length }})</span>
        <q-btn v-if="editable" flat dense round icon="add" color="primary" :data-cy="`add-${group.type}-btn`" @click="$emit('add', group.type)">
          <q-tooltip>{{ group.addLabel }}</q-tooltip>
        </q-btn>
      </div>
      <div v-if="group.items.length" class="diploma-grid">
        <div v-for="d in group.items" :key="d.id" class="diploma-item">
          <div class="relative-position">
            <img :src="diplomaImage(d)" :alt="d.name" class="diploma-image" />
            <q-btn
              v-if="editable"
              round
              dense
              size="xs"
              color="negative"
              icon="close"
              class="remove-btn"
              @click="$emit('remove', { type: group.type, item: d })"
            />
          </div>
          <div class="diploma-name">{{ d.name.replace(/^Πτυχίο /, '') }}</div>
        </div>
      </div>
      <div v-else class="text-grey-6">{{ $t('progress.none') }}</div>
    </div>

    <!-- Paths by chapter -->
    <div class="section-title">
      <span>{{ $t('progress.paths') }} ({{ progress?.completedPaths?.length || 0 }})</span>
      <q-btn v-if="editable" flat dense round icon="add" color="primary" data-cy="add-path-btn" @click="$emit('add', 'path')">
        <q-tooltip>{{ $t('progress.addPath') }}</q-tooltip>
      </q-btn>
    </div>
    <div class="row q-col-gutter-md">
      <div v-for="chapter in pathsByChapter" :key="chapter.category" class="col-12 col-md-6">
        <q-card flat bordered class="chapter-card">
          <q-card-section class="q-py-sm">
            <div class="text-weight-medium">
              {{ $t(`progress.chapters.${chapter.category}`) }}
              <q-badge :color="chapter.paths.length ? 'positive' : 'grey-5'" class="q-ml-xs">{{ chapter.paths.length }}</q-badge>
            </div>
          </q-card-section>
          <q-list dense separator>
            <q-item v-for="p in chapter.paths" :key="p.id">
              <q-item-section avatar class="path-number">{{ p.number }}.</q-item-section>
              <q-item-section>
                {{ p.name }}
                <q-tooltip max-width="320px">{{ p.description }}</q-tooltip>
              </q-item-section>
              <q-item-section v-if="editable" side>
                <q-btn flat dense round size="sm" icon="close" color="negative" @click="$emit('remove', { type: 'path', item: p })" />
              </q-item-section>
            </q-item>
            <q-item v-if="!chapter.paths.length">
              <q-item-section class="text-grey-6">{{ $t('progress.none') }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { PATH_CHAPTERS, diplomaImage, peakImage } from '@/utils/badges';

const props = defineProps({
  // progress object from the API (evaluation is optional)
  progress: { type: Object, default: null },
  // peaks from the catalog, to name the next peak
  peaks: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false },
});
defineEmits(['promise', 'add', 'remove']);

const { t } = useI18n();

const currentPeak = computed(() => props.progress?.currentPeak || null);
const evaluation = computed(() => props.progress?.evaluation || null);
const nextPeak = computed(() => evaluation.value?.peaks.find((p) => !p.met) || null);

const GUIDE_LEVEL = { bronze: 'Α', silver: 'Β', gold: 'Γ' };

const peakName = (type) => props.peaks.find((p) => p.type === type)?.name || type;

const requirementLabel = (r, peakType) => {
  switch (r.key) {
    case 'guideDiploma': return t('progress.req.guideDiploma', { level: GUIDE_LEVEL[peakType] });
    default: return t(`progress.req.${r.key}`);
  }
};

const diplomaGroups = computed(() => [
  {
    type: 'guide',
    title: t('progress.guideDiplomas'),
    addLabel: t('progress.addGuideDiploma'),
    items: [...(props.progress?.guideDiplomas || [])].sort((a, b) => a.level - b.level),
  },
  {
    type: 'elective',
    title: t('progress.electiveDiplomas'),
    addLabel: t('progress.addElectiveDiploma'),
    items: [...(props.progress?.electiveDiplomas || [])].sort((a, b) => a.number - b.number),
  },
]);

const pathsByChapter = computed(() => PATH_CHAPTERS.map((category) => ({
  category,
  paths: (props.progress?.completedPaths || [])
    .filter((p) => p.category === category)
    .sort((a, b) => a.number - b.number),
})));
</script>

<style scoped>
.peak-image {
  display: block;
  width: 180px;
  height: 180px;
  margin: 0 auto;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
}
.peak-placeholder {
  width: 180px;
  height: 180px;
  margin: 0 auto;
  border-radius: 50%;
  border: 3px dashed rgba(128, 128, 128, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.checklist-icon {
  min-width: 32px;
}
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}
.diploma-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 12px;
}
.diploma-item {
  text-align: center;
}
.diploma-image {
  width: 72px;
  height: 72px;
  object-fit: contain;
}
.remove-btn {
  position: absolute;
  top: -4px;
  right: calc(50% - 40px);
}
.diploma-name {
  font-size: 0.8rem;
  line-height: 1.2;
  margin-top: 4px;
}
.path-number {
  min-width: 32px;
  font-weight: 600;
  color: var(--q-primary);
}
</style>
