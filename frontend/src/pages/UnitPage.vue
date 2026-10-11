<template>
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
            <q-skeleton type="QChip" width="110px" height="24px" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-skeleton type="text" width="100px" class="q-mb-sm" />
          <q-skeleton type="text" width="80%" />
          <q-skeleton type="text" width="60%" />
        </q-card-section>
      </q-card>
      <section class="q-mb-lg">
        <q-skeleton type="text" width="120px" class="q-mb-sm" />
        <q-skeleton class="corner-tile" type="rect" style="aspect-ratio: 16 / 9" height="auto" />
      </section>
      <section class="q-mb-lg">
        <q-skeleton type="text" width="100px" class="q-mb-sm" />
        <div class="activity-grid">
          <q-skeleton v-for="n in 3" :key="n" type="rect" style="aspect-ratio: 1" height="auto" />
        </div>
      </section>
      <q-skeleton type="text" width="90px" class="q-mb-sm" />
      <div class="tf-card-grid" style="--tf-min: 240px">
        <q-card v-for="n in 4" :key="n" flat bordered>
          <q-card-section class="row items-center no-wrap q-gutter-sm">
            <q-skeleton type="QAvatar" size="48px" />
            <div class="col">
              <q-skeleton type="text" width="60%" />
              <q-skeleton type="text" width="35%" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template v-else-if="unit">
      <div class="row items-center q-pt-md q-pb-sm">
        <q-btn flat dense no-caps icon="arrow_back" :label="$t('general.back')" color="primary" @click="$router.back()" />
        <q-space />
        <q-btn
          v-if="canEdit"
          :outline="!editing"
          :color="'primary'"
          no-caps
          :icon="editing ? 'check' : 'edit'"
          :label="editing ? $t('unitPage.done') : $t('unitPage.edit')"
          @click="toggleEditing"
        />
      </div>

      <!-- Καρτέλα ενωμοτίας: σημαία, όνομα, κραυγή -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <div class="unit-flag">
            <img v-if="unit.flag" :src="url(unit.flag)" :alt="unit.name" />
            <q-icon v-else name="flag" size="40px" />
            <q-btn
              v-if="editing"
              round
              dense
              size="sm"
              color="primary"
              icon="edit"
              class="unit-flag__edit"
              :loading="busy === 'flag'"
              :aria-label="$t('unitPage.changeFlag')"
              @click="flagInput.click()"
            >
              <q-tooltip>{{ $t('unitPage.changeFlag') }}</q-tooltip>
            </q-btn>
            <input ref="flagInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden @change="onFlag" />
          </div>
          <div class="col">
            <h1 class="page-title">{{ unit.name }}</h1>
            <q-chip
              v-if="unit.location"
              dense
              square
              clickable
              color="grey-2"
              text-color="grey-9"
              icon="place"
              class="q-ml-none"
              @click="$router.push(`/locations/${unit.location.id}`)"
            >
              {{ unit.location.name }}
            </q-chip>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="tf-card-head"><q-icon name="campaign" />{{ $t('unitPage.yell') }}</div>
          <template v-if="editing">
            <q-input v-model="yell" outlined autogrow :maxlength="300" />
            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps color="grey-8" :label="$t('general.cancel')" :disable="yell === (unit.description || '')" @click="yell = unit.description || ''" />
              <q-btn color="primary" no-caps :label="$t('general.save')" :disable="yell === (unit.description || '')" :loading="busy === 'yell'" @click="saveYell" />
            </div>
          </template>
          <div v-else class="text-body1 yell">{{ unit.description || $t('unitPage.noDescription') }}</div>
        </q-card-section>
      </q-card>

      <!-- Η Γωνιά μας -->
      <section class="q-mb-lg">
        <div class="tf-card-head"><q-icon name="home" />{{ $t('unitPage.corner') }}</div>
        <PhotoTile
          v-if="corner || editing"
          class="corner-tile"
          ratio="16 / 9"
          :src="corner && url(corner.path)"
          :editing="editing"
          replaceable
          :busy="busy === 'corner'"
          @open="openPhoto(corner)"
          @file="(f) => addPhoto('corner', f)"
          @remove="removePhoto(corner)"
        />
        <div v-else class="text-caption text-grey-6">{{ $t('unitPage.noCorner') }}</div>
      </section>

      <!-- Δράσεις -->
      <section class="q-mb-lg">
        <div class="tf-card-head">
          <q-icon name="photo_library" />{{ $t('unitPage.activities') }}
          <span v-if="editing" class="text-caption text-grey-7 q-ml-sm">{{ activities.length }}/{{ MAX_ACTIVITIES }}</span>
        </div>
        <div v-if="activities.length || editing" class="activity-grid">
          <PhotoTile
            v-for="photo in activities"
            :key="photo.id"
            :src="url(photo.path)"
            :editing="editing"
            :busy="busy === photo.id"
            @open="openPhoto(photo)"
            @remove="removePhoto(photo)"
          />
          <PhotoTile
            v-if="editing && activities.length < MAX_ACTIVITIES"
            editing
            :busy="busy === 'activity'"
            @file="(f) => addPhoto('activity', f)"
          />
        </div>
        <div v-else class="text-caption text-grey-6">{{ $t('unitPage.noActivities') }}</div>
      </section>

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
              <div class="text-caption text-grey-7">{{ memberRole(member) }}</div>
            </div>
            <q-icon name="chevron_right" color="grey-6" />
          </q-card-section>
        </q-card>
      </div>
      <div v-else class="text-caption text-grey-6 q-pa-md">{{ $t('unitPage.noMembers') }}</div>

      <PhotoLightbox v-model="lightbox" :photos="galleryUrls" />
    </template>

    <div v-else class="column items-center q-pa-xl text-center">
      <div class="tf-tile" style="--tile-size: 64px"><q-icon name="groups" size="32px" /></div>
      <div class="section-title q-mt-md">{{ $t('unitPage.notFound') }}</div>
      <q-btn flat no-caps color="primary" icon="arrow_back" :label="$t('general.back')" class="q-mt-sm" @click="$router.back()" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUnitStore } from '@/stores/unit';
import { useAuthStore } from '@/stores/auth';
import { config } from '@/config';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import PhotoTile from '@/components/unit/PhotoTile.vue';
import PhotoLightbox from '@/components/unit/PhotoLightbox.vue';

const MAX_ACTIVITIES = 9;

const route = useRoute();
const { t } = useI18n();
const $q = useQuasar();
const unitStore = useUnitStore();
const authStore = useAuthStore();

// only the unit of this URL: never the previous one while the next loads
const unit = computed(() => (String(unitStore.currentUnit?.id) === String(route.params.id) ? unitStore.currentUnit : null));
const loading = ref(true);

const url = (path) => (path?.startsWith('http') ? path : `${config.apiUrl}${path}`);

// Ίδιος κανόνας με το backend (units/unit-access.ts)
const canEdit = computed(() => {
  const user = authStore.user;
  if (!user || !unit.value) return false;
  if (authStore.isSuperAdmin) return true;
  if (user.role === 'admin') return user.location?.id === unit.value.location?.id;
  return user.unit?.id === unit.value.id && user.unitRole === 'leader';
});

const editing = ref(false);
const busy = ref(null); // 'flag' | 'yell' | 'corner' | 'activity' | photo id
const yell = ref('');
const flagInput = ref(null);
const lightbox = ref(null);

const photos = computed(() => unit.value?.photos || []);
const corner = computed(() => photos.value.find((p) => p.kind === 'corner') || null);
const activities = computed(() => photos.value.filter((p) => p.kind === 'activity'));
// η γωνιά πρώτη, μετά οι δράσεις: η ίδια σειρά με τη σελίδα
const gallery = computed(() => [corner.value, ...activities.value].filter(Boolean));
const galleryUrls = computed(() => gallery.value.map((p) => url(p.path)));

const openPhoto = (photo) => {
  lightbox.value = gallery.value.findIndex((p) => p.id === photo.id);
};

const toggleEditing = () => {
  editing.value = !editing.value;
  yell.value = unit.value.description || '';
};

// the server answers in English; show the known cases in the user's language
const errorMessage = (error) => {
  if (/at most \d+ activity photos/i.test(error)) return t('unitPage.errors.tooManyPhotos');
  if (/too large/i.test(error)) return t('unitPage.errors.tooLarge');
  if (/not a readable image|only jpeg/i.test(error)) return t('unitPage.errors.notImage');
  return t('unitPage.uploadError');
};
const notifyError = () => $q.notify({ color: 'negative', icon: 'report_problem', message: errorMessage(unitStore.error || '') });

const run = async (key, action) => {
  busy.value = key;
  try {
    const ok = await action();
    if (!ok) notifyError();
    return ok;
  } finally {
    busy.value = null;
  }
};

const addPhoto = (kind, file) => run(kind, () => unitStore.uploadUnitPhoto(unit.value.id, kind, file));

const removePhoto = (photo) => {
  $q.dialog({ message: t('unitPage.confirmRemove'), cancel: true, persistent: true }).onOk(() =>
    run(photo.id, () => unitStore.deleteUnitPhoto(unit.value.id, photo.id)));
};

const onFlag = (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (file) run('flag', () => unitStore.uploadUnitFlag(unit.value.id, file));
};

const saveYell = async () => {
  const ok = await run('yell', () => unitStore.updateUnit(unit.value.id, { description: yell.value }));
  if (ok) $q.notify({ color: 'positive', icon: 'check_circle', message: t('unitPage.saved') });
};

const memberRole = (member) => {
  if (member.unitRole === 'leader') return t('adminUsers.roles.leader');
  if (member.unitRole === 'deputy_leader') return t('adminUsers.roles.deputyLeader');
  return member.role === 'admin' ? t('unitPage.roles.captain') : t('unitPage.roles.guide');
};

watch(() => route.params.id, async (id) => {
  editing.value = false;
  lightbox.value = null;
  loading.value = true;
  if (id) await unitStore.fetchUnit(id);
  loading.value = false;
}, { immediate: true });
</script>

<style scoped>
.unit-flag {
  position: relative;
  flex: 0 0 auto;
  width: 88px;
  height: 88px;
  border-radius: var(--radius-card);
  overflow: visible;
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
  border-radius: inherit;
}
.unit-flag__edit {
  position: absolute;
  right: -8px;
  bottom: -8px;
}
.yell {
  white-space: pre-line;
  font-style: italic;
}
.corner-tile {
  max-width: 720px;
}
.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 599px) {
  .activity-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
