<template>
  <div>
    <div class="text-subtitle1 text-weight-bold q-mb-md flex items-center">
      <q-icon name="trending_up" class="q-mr-sm" color="primary" />
      {{ $t('progress.title') }}
    </div>

    <div v-if="!progress" class="flex flex-center q-pa-xl">
      <q-spinner size="40px" color="primary" />
    </div>
    <ProgressOverview
      v-else
      :progress="progress"
      :peaks="catalog.peaks"
      editable
      @promise="setPromise"
      @add="openAdd"
      @remove="confirmRemove"
    />

    <!-- Add path / diploma -->
    <q-dialog v-model="addDialog.open">
      <q-card style="width: 560px; max-width: 95vw">
        <q-card-section class="text-h6">{{ addDialog.title }}</q-card-section>
        <q-card-section class="q-pt-none">
          <q-select
            v-model="addDialog.selected"
            :options="filteredOptions"
            :label="addDialog.type === 'path' ? $t('progress.selectPath') : $t('progress.selectDiploma')"
            option-label="label"
            filled
            use-input
            input-debounce="0"
            autofocus
            data-cy="award-select"
            @filter="(val, update) => update(() => { addDialog.query = val })"
          >
            <template #option="scope">
              <q-item v-if="scope.opt.header" dense class="text-primary text-weight-bold">
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
              <q-item v-else v-bind="scope.itemProps">
                <q-item-section v-if="scope.opt.image" avatar>
                  <img :src="scope.opt.image" style="width: 36px; height: 36px" />
                </q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
          <div v-if="addDialog.selected?.details" class="q-mt-md text-body2 text-grey-8 selected-details">
            {{ addDialog.selected.details }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('general.cancel')" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="$t('general.award')"
            :disable="!addDialog.selected"
            :loading="saving"
            data-cy="award-confirm-btn"
            @click="award"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { api } from '@/api';
import { useProgressStore } from '@/stores/progress';
import { diplomaImage } from '@/utils/badges';
import ProgressOverview from './ProgressOverview.vue';

const props = defineProps({
  userId: { type: Number, required: true },
});

const $q = useQuasar();
const { t } = useI18n();
const catalog = useProgressStore();

const progress = ref(null);
const saving = ref(false);
const addDialog = reactive({ open: false, type: null, title: '', selected: null, query: '' });

const base = computed(() => `/users/${props.userId}/progress`);

const load = async () => {
  progress.value = null;
  const [res] = await Promise.all([api.get(base.value), catalog.fetchCatalog()]);
  progress.value = res.data;
};
watch(() => props.userId, load, { immediate: true });

// Apply an API result; celebrate when the derived peak goes up
const apply = (data, message) => {
  const before = progress.value?.currentPeak?.code;
  progress.value = data;
  const after = data.currentPeak;
  const order = (code) => catalog.peaks.find((p) => p.code === code)?.order ?? 0;
  if (after && after.code !== 'promise' && order(after.code) > order(before)) {
    $q.notify({ type: 'positive', icon: 'emoji_events', message: t('progress.notifications.peakReached', { name: after.name }) });
  } else {
    $q.notify({ type: 'positive', message });
  }
};

const run = async (request, message) => {
  saving.value = true;
  try {
    apply((await request()).data, message);
    return true;
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('progress.notifications.error') });
    return false;
  } finally {
    saving.value = false;
  }
};

const setPromise = (given) => {
  if (given) {
    run(() => api.post(`${base.value}/promise`), t('progress.notifications.saved'));
    return;
  }
  $q.dialog({ title: t('progress.removePromise'), message: t('progress.confirmRemovePromise'), cancel: true })
    .onOk(() => run(() => api.delete(`${base.value}/promise`), t('progress.notifications.removed')));
};

// --- add -----------------------------------------------------------------

const TITLES = { path: 'progress.addPath', guide: 'progress.addGuideDiploma', elective: 'progress.addElectiveDiploma' };

const openAdd = (type) => {
  Object.assign(addDialog, { open: true, type, title: t(TITLES[type]), selected: null, query: '' });
};

const options = computed(() => {
  const p = progress.value;
  if (!p) return [];
  if (addDialog.type === 'path') {
    const owned = new Set(p.completedPaths.map((x) => x.id));
    return catalog.pathsByChapter.flatMap((chapter) => [
      { header: true, label: t(`progress.chapters.${chapter.category}`), disable: true },
      ...chapter.paths.filter((x) => !owned.has(x.id)).map((x) => ({
        value: x.id, label: `${x.number}. ${x.name}`, details: x.description,
      })),
    ]);
  }
  const owned = new Set((addDialog.type === 'guide' ? p.guideDiplomas : p.electiveDiplomas).map((x) => x.id));
  const list = addDialog.type === 'guide' ? catalog.guideDiplomas : catalog.electiveDiplomas;
  return list.filter((d) => !owned.has(d.id)).map((d) => ({
    value: d.id,
    label: d.name,
    image: diplomaImage(d),
    details: d.requirements.map((r) => `${r.n}. ${r.text}`).join('\n'),
  }));
});

const filteredOptions = computed(() => {
  const q = addDialog.query.trim().toLowerCase();
  if (!q) return options.value;
  return options.value.filter((o) => !o.header && o.label.toLowerCase().includes(q));
});

const award = async () => {
  const id = addDialog.selected.value;
  const ok = addDialog.type === 'path'
    ? await run(() => api.post(`${base.value}/paths`, { pathId: id }), t('progress.notifications.saved'))
    : await run(() => api.post(`${base.value}/diplomas`, { diplomaId: id, type: addDialog.type }), t('progress.notifications.saved'));
  if (ok) addDialog.open = false;
};

// --- remove --------------------------------------------------------------

const confirmRemove = ({ type, item }) => {
  const url = type === 'path' ? `${base.value}/paths/${item.id}` : `${base.value}/diplomas/${type}/${item.id}`;
  $q.dialog({ title: t('progress.remove'), message: t('progress.confirmRemove', { name: item.name }), cancel: true })
    .onOk(() => run(() => api.delete(url), t('progress.notifications.removed')));
};
</script>

<style scoped>
.selected-details {
  white-space: pre-line;
  max-height: 220px;
  overflow-y: auto;
}
</style>
