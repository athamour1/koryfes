<template>
  <div class="progress-overview">
    <!-- Κορυφές: η μία ματιά — ποιες έχουν κατακτηθεί -->
    <div v-if="peaks.length" class="row items-center q-gutter-xs q-mb-md">
      <q-chip
        v-for="peak in peakChips"
        :key="peak.type"
        dense
        :color="peak.reached ? 'primary' : 'grey-3'"
        :text-color="peak.reached ? 'white' : 'grey-7'"
        :icon="peak.type === 'promise' ? 'handshake' : 'terrain'"
        :label="peak.label"
      />
    </div>

    <!-- Τρέχουσα Κορυφή + τι λείπει για την επόμενη -->
    <div class="peak-hero q-mb-lg">
      <div class="peak-hero__badge">
        <img v-if="currentPeak" :key="currentPeak.code" :src="peakImage(currentPeak)" :alt="currentPeak.name" class="peak-image" />
        <div v-else class="peak-placeholder">
          <q-icon name="landscape" size="48px" />
        </div>
        <div class="text-weight-bold q-mt-sm text-center">{{ currentPeak?.name || $t('progress.noPromise') }}</div>
        <div v-if="editable" class="q-mt-xs text-center">
          <q-btn
            v-if="!currentPeak"
            unelevated
            no-caps
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
            no-caps
            size="sm"
            color="grey-7"
            icon="undo"
            :label="$t('progress.removePromise')"
            @click="$emit('promise', false)"
          />
        </div>
      </div>

      <div v-if="nextPeak" class="peak-hero__next">
        <div v-if="peaks.length" class="section-title q-mb-xs">{{ $t('progress.nextPeak', { name: peakName(nextPeak.type) }) }}</div>
        <q-skeleton v-else type="text" width="200px" class="q-mb-xs" />
        <div v-if="!currentPeak" class="text-caption text-grey-7 q-mb-sm">{{ $t('progress.promiseFirst') }}</div>
        <div v-for="(r, i) in nextPeak.requirements" :key="i" class="req">
          <div class="req__row">
            <q-icon :name="r.met ? 'check_circle' : 'radio_button_unchecked'" :color="r.met ? 'positive' : 'grey-5'" size="20px" />
            <span class="req__label">{{ requirementLabel(r, nextPeak.type) }}</span>
            <span v-if="r.required > 1" class="req__count" :class="{ 'text-positive': r.met }">{{ r.current }}/{{ r.required }}</span>
          </div>
          <q-linear-progress
            v-if="r.required > 1"
            :value="r.current / r.required"
            :color="r.met ? 'positive' : 'primary'"
            track-color="grey-3"
            size="6px"
            class="req__bar"
          />
        </div>
      </div>
      <div v-else-if="evaluation" class="peak-hero__next self-center text-positive text-weight-bold">
        <q-icon name="emoji_events" size="22px" class="q-mr-xs" />{{ $t('progress.allPeaksReached') }}
      </div>
    </div>

    <!-- Πτυχία -->
    <div v-for="group in diplomaGroups" :key="group.type" class="q-mb-lg">
      <div class="row items-center justify-between q-mb-sm">
        <div class="section-title">{{ group.title }} <span class="text-grey-6">· {{ group.items.length }}</span></div>
        <q-btn
          v-if="editable"
          flat
          dense
          no-caps
          color="primary"
          icon="add"
          :label="group.addLabel"
          :data-cy="`add-${group.type}-btn`"
          @click="$emit('add', group.type)"
        />
      </div>
      <div v-if="group.items.length" class="badge-grid">
        <div v-for="d in group.items" :key="d.id" class="badge-tile tf-rise">
          <img :src="diplomaImage(d)" :alt="d.name" class="badge-tile__img" />
          <div class="badge-tile__name">{{ d.name.replace(/^Πτυχίο /, '') }}</div>
          <q-btn
            v-if="editable"
            round
            dense
            unelevated
            size="xs"
            color="negative"
            icon="close"
            class="badge-tile__remove"
            :aria-label="$t('progress.remove')"
            @click="$emit('remove', { type: group.type, item: d })"
          />
        </div>
      </div>
      <div v-else class="text-caption text-grey-6">{{ $t('progress.none') }}</div>
    </div>

    <!-- Μονοπάτια ανά κεφάλαιο -->
    <div class="row items-center justify-between q-mb-sm">
      <div class="section-title">{{ $t('progress.paths') }} <span class="text-grey-6">· {{ progress?.completedPaths?.length || 0 }}</span></div>
      <q-btn
        v-if="editable"
        flat
        dense
        no-caps
        color="primary"
        icon="add"
        :label="$t('progress.addPathShort')"
        data-cy="add-path-btn"
        @click="$emit('add', 'path')"
      />
    </div>
    <div class="tf-card-grid" style="--tf-min: 280px">
      <q-card v-for="chapter in pathsByChapter" :key="chapter.category" flat bordered>
        <q-card-section class="q-pb-xs">
          <div class="row items-center no-wrap q-gutter-sm">
            <div class="text-caption text-weight-bold text-grey-8 col">{{ $t(`progress.chapters.${chapter.category}`) }}</div>
            <q-badge :color="chapter.paths.length ? 'primary' : 'grey-5'" :label="chapter.paths.length" />
          </div>
        </q-card-section>
        <q-list dense>
          <q-item v-for="p in chapter.paths" :key="p.id">
            <q-item-section avatar class="path-number">{{ p.number }}.</q-item-section>
            <q-item-section>
              <q-item-label>{{ p.name }}</q-item-label>
              <q-tooltip max-width="320px">{{ p.description }}</q-tooltip>
            </q-item-section>
            <q-item-section v-if="editable" side>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="delete"
                color="negative"
                :aria-label="$t('progress.remove')"
                @click="$emit('remove', { type: 'path', item: p })"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="!chapter.paths.length">
            <q-item-section class="text-caption text-grey-5">—</q-item-section>
          </q-item>
        </q-list>
      </q-card>
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
  // peaks from the catalog, to name them
  peaks: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false },
});
defineEmits(['promise', 'add', 'remove']);

const { t } = useI18n();

const currentPeak = computed(() => props.progress?.currentPeak || null);
const evaluation = computed(() => props.progress?.evaluation || null);
const nextPeak = computed(() => evaluation.value?.peaks.find((p) => !p.met) || null);

const PEAK_ORDER = ['promise', 'bronze', 'silver', 'gold'];
const GUIDE_LEVEL = { bronze: 'Α', silver: 'Β', gold: 'Γ' };

const peakName = (type) => props.peaks.find((p) => p.type === type)?.name || type;

// Υπόσχεση + 3 Κορυφές, χρωματιστές όσες έχουν κατακτηθεί
const peakChips = computed(() => {
  const reachedOrder = PEAK_ORDER.indexOf(currentPeak.value?.type ?? '');
  return PEAK_ORDER.map((type, i) => ({
    type,
    reached: reachedOrder >= i,
    label: peakName(type).replace(/\s*\(.*\)$/, ''),
  }));
});

const requirementLabel = (r, peakType) => {
  if (r.key === 'guideDiploma') return t('progress.req.guideDiploma', { level: GUIDE_LEVEL[peakType] });
  return t(`progress.req.${r.key}`);
};

const diplomaGroups = computed(() => [
  {
    type: 'guide',
    title: t('progress.guideDiplomas'),
    addLabel: t('progress.addGuideDiplomaShort'),
    items: [...(props.progress?.guideDiplomas || [])].sort((a, b) => a.level - b.level),
  },
  {
    type: 'elective',
    title: t('progress.electiveDiplomas'),
    addLabel: t('progress.addElectiveDiplomaShort'),
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
.peak-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 28px;
  align-items: flex-start;
}
.peak-hero__badge {
  flex: 0 0 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.peak-hero__next {
  flex: 1 1 260px;
  min-width: 0;
}
@media (max-width: 599px) {
  .peak-hero__badge {
    flex-basis: 100%;
  }
}
.peak-image {
  display: block;
  width: 136px;
  height: 136px;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(16, 22, 28, 0.18));
  animation: peak-pop 420ms var(--ease-emphasized) both;
}
/* Η εικόνα «σκάει» μαλακά όταν αλλάζει Κορυφή (key στο code). */
@keyframes peak-pop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.peak-placeholder {
  width: 136px;
  height: 136px;
  border-radius: 50%;
  border: 2px dashed var(--line);
  color: var(--muted);
  display: grid;
  place-items: center;
}
.req {
  padding: 6px 0;
}
.req__row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.req__label {
  flex: 1 1 auto;
  min-width: 0;
}
.req__count {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--muted);
}
.req__bar {
  margin: 6px 0 0 30px;
  width: calc(100% - 30px);
}
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 10px;
}
.badge-tile {
  position: relative;
  text-align: center;
  padding: 10px 6px 8px;
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
.badge-tile__img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  transition: transform var(--dur-medium) var(--ease-emphasized);
}
.badge-tile:hover .badge-tile__img {
  transform: scale(1.06);
}
.badge-tile__name {
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.2;
  margin-top: 6px;
  color: var(--ink);
}
.badge-tile__remove {
  position: absolute;
  top: 6px;
  right: 6px;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity var(--dur-medium) var(--ease-standard), transform var(--dur-medium) var(--ease-emphasized);
}
.badge-tile:hover .badge-tile__remove,
.badge-tile:focus-within .badge-tile__remove {
  opacity: 1;
  transform: none;
}
/* Οθόνες αφής: χωρίς hover, το κουμπί μένει πάντα ορατό. */
@media (hover: none) {
  .badge-tile__remove {
    opacity: 1;
    transform: none;
  }
}
.path-number {
  min-width: 30px;
  font-weight: 700;
  color: var(--klados-ink);
}
</style>
