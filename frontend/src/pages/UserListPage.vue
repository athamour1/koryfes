<template>
  <q-page class="tf-page social-feed-page">
    <PageHeader
      icon="people"
      :title="$t('userListPage.title')"
      :subtitle="subtitle"
    >
      <template #extra>
        <q-input
          v-model="filterName"
          outlined
          dense
          clearable
          debounce="300"
          :placeholder="$t('userListPage.searchPlaceholder')"
          class="search-input"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </template>
    </PageHeader>

    <!-- Το τοπικό μου / όλοι οι Οδηγοί της Ελλάδας -->
    <div v-if="myLocation" class="scope-tabs">
      <SegmentedToggle v-model="scope" :options="scopeOptions" />
    </div>

    <!-- οι Οδηγοί έρχονται λίγοι-λίγοι από τον server όσο κατεβαίνει η σελίδα -->
    <q-infinite-scroll ref="scroller" :offset="400" @load="onLoad">
      <div class="tf-card-grid" style="--tf-min: 300px">
        <q-card
          v-for="user in users"
          :key="user.id"
          flat
          bordered
          class="cursor-pointer user-card"
          @click="$router.push(`/user/${user.id}`)"
        >
          <q-card-section class="row items-center no-wrap q-gutter-md">
            <div class="user-avatar">
              <AvatarDisplay :config="user.avatarConfig" size="64px" :key="`avatar-${user.id}`" />
            </div>
            <div class="col">
              <div class="text-weight-bold ellipsis user-name">{{ user.username }}</div>
              <div class="text-caption text-grey-7 ellipsis">
                <q-icon name="place" size="14px" />
                <a
                  v-if="user.location"
                  class="location-link"
                  :href="`/locations/${user.location.id}`"
                  @click.stop.prevent="$router.push(`/locations/${user.location.id}`)"
                >{{ user.location.name }}</a>
                <template v-else>{{ $t('userListPage.noLocation') }}</template>
              </div>
              <div v-if="user.unit" class="row items-center q-gutter-xs q-mt-xs">
                <!-- η ενωμοτία ανοίγει τη σελίδα της, όχι το προφίλ της κάρτας -->
                <q-chip
                  dense
                  square
                  clickable
                  color="grey-2"
                  text-color="grey-9"
                  icon="groups"
                  @click.stop="$router.push(`/units/${user.unit.id}`)"
                >{{ user.unit.name }}</q-chip>
                <q-chip
                  v-if="user.unitRole"
                  dense
                  square
                  :color="user.unitRole === 'member' ? 'grey-2' : 'primary'"
                  :text-color="user.unitRole === 'member' ? 'grey-9' : 'white'"
                >{{ formatUnitRole(user.unitRole) }}</q-chip>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="row items-center no-wrap q-gutter-sm">
            <img
              v-if="user.progress?.currentPeak"
              :src="peakImage(user.progress.currentPeak)"
              :alt="user.progress.currentPeak.name"
              class="peak-thumb"
            />
            <div v-else class="tf-tile" style="--tile-size: 44px"><q-icon name="landscape" size="22px" /></div>
            <div class="col">
              <div class="text-weight-medium ellipsis">{{ user.progress?.currentPeak?.name || $t('progress.admin.noPeak') }}</div>
              <div class="text-caption text-grey-7">
                {{ user.progress?.pathCount || 0 }} {{ $t('progress.paths') }}
                · {{ (user.progress?.guideDiplomaCount || 0) + (user.progress?.electiveDiplomaCount || 0) }} {{ $t('progress.diplomasShort') }}
              </div>
            </div>
            <q-icon name="chevron_right" color="grey-6" size="22px" class="chevron" />
          </q-card-section>
        </q-card>
      </div>

      <template #loading>
        <!-- το Quasar κρατά το slot στη σελίδα (αόρατο) και όταν δεν φορτώνει·
             χωρίς v-if οι σκελετοί σπρώχνουν το sentinel εκτός οθόνης -->
        <div v-if="fetching" class="tf-card-grid" :class="{ 'skeleton-grid': users.length }" style="--tf-min: 300px">
          <UserCardSkeleton v-for="n in (users.length ? 3 : 9)" :key="n" />
        </div>
      </template>
    </q-infinite-scroll>

    <div v-if="loadError" class="empty-state">
      <div class="text-caption text-grey-7">{{ $t('userListPage.loadError') }}</div>
      <q-btn flat no-caps color="primary" icon="refresh" :label="$t('general.retry')" class="q-mt-sm" @click="restart" />
    </div>

    <div v-else-if="finished && users.length === 0" class="empty-state">
      <div class="tf-tile q-mx-auto" style="--tile-size: 64px"><q-icon name="people_outline" size="32px" /></div>
      <div class="section-title q-mt-md">{{ $t('userListPage.emptyState.title') }}</div>
      <div class="text-caption text-grey-7">{{ $t('userListPage.emptyState.subtitle') }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/api';
import { useAuthStore } from '@/stores/auth';
import { peakImage } from '@/utils/badges';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import PageHeader from '@/components/PageHeader.vue';
import SegmentedToggle from '@/components/SegmentedToggle.vue';
import UserCardSkeleton from '@/components/skeletons/UserCardSkeleton.vue';

const PAGE_SIZE = 24;

const authStore = useAuthStore();
const filterName = ref('');
const { t } = useI18n();

// Το τοπικό του χρήστη· ο super admin ανήκει στο Admin HQ, που δεν έχει Οδηγούς
const myLocation = computed(() => (authStore.isSuperAdmin ? null : authStore.user?.location ?? null));

// μέχρι να διαλέξει ο χρήστης: το τοπικό του, αν έχει (ο χρήστης μπορεί να φορτώσει αργότερα)
const chosenScope = ref(null);
const scope = computed({
  get: () => chosenScope.value ?? (myLocation.value ? 'local' : 'all'),
  set: (value) => { chosenScope.value = value; },
});
const scopeOptions = computed(() => [
  { label: t('userListPage.scope.local'), value: 'local', icon: 'place' },
  { label: t('userListPage.scope.all'), value: 'all', icon: 'public' },
]);

const subtitle = computed(() => (scope.value === 'local' && myLocation.value
  ? t('userListPage.subtitleLocal', { location: myLocation.value.name })
  : t('userListPage.subtitleAll')));

// Μόνο Οδηγοί (role user): του τοπικού του χρήστη ή όλης της Ελλάδας
const params = computed(() => ({
  role: 'user',
  scope: 'all',
  locationId: scope.value === 'local' ? myLocation.value?.id : undefined,
  search: filterName.value || undefined,
}));

const scroller = ref(null);
const users = ref([]);
const finished = ref(false);
const loadError = ref(false);
const fetching = ref(false);
// κάθε αλλαγή φίλτρου ξεκινά νέα «γενιά»· απαντήσεις παλιότερων αγνοούνται
let generation = 0;

const onLoad = async (index, onDone) => {
  const gen = generation;
  fetching.value = true;
  const done = (stop) => {
    fetching.value = false;
    onDone(stop);
  };
  try {
    const { data } = await api.get('/users', {
      params: { ...params.value, page: index, limit: PAGE_SIZE, sortBy: 'username' },
    });
    if (gen !== generation) return done();
    users.value.push(...data.items);
    finished.value = users.value.length >= data.total;
    done(finished.value);
  } catch (error) {
    console.error('Fetch users failed', error);
    if (gen !== generation) return done();
    loadError.value = true;
    done(true);
  }
};

const restart = () => {
  generation++;
  users.value = [];
  finished.value = false;
  loadError.value = false;
  scroller.value?.reset();
  scroller.value?.resume();
  scroller.value?.trigger();
};

watch(params, restart, { deep: true });

const formatUnitRole = (unitRole) => {
  if (!unitRole) return '-';
  switch(unitRole) {
    case 'leader': return t('adminUsers.roles.leader');
    case 'deputy_leader': return t('adminUsers.roles.deputyLeader');
    case 'member': return t('adminUsers.roles.member');
    default: return unitRole;
  }
};
</script>

<style scoped>
.location-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
  text-underline-offset: 2px;
}
.location-link:hover {
  color: var(--klados-ink);
}
.scope-tabs {
  margin-bottom: 16px;
}
.user-avatar {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--klados-color) 10%, var(--surface));
  border: 1px solid var(--border-soft);
}
.user-name {
  font-size: 1.05rem;
}
.peak-thumb {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.chevron {
  transition: transform var(--dur-medium) var(--ease-emphasized);
}
.user-card:hover .chevron {
  transform: translateX(3px);
}
.skeleton-grid {
  margin-top: 16px;
}
.empty-state {
  text-align: center;
  padding: 64px 20px;
}
</style>
