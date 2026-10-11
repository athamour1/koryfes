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

    <div class="tf-card-grid" style="--tf-min: 300px">
      <q-card
        v-for="user in filteredUsers"
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
              {{ user.progress?.completedPaths?.length || 0 }} {{ $t('progress.paths') }}
              · {{ (user.progress?.guideDiplomas?.length || 0) + (user.progress?.electiveDiplomas?.length || 0) }} {{ $t('progress.diplomasShort') }}
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="22px" class="chevron" />
        </q-card-section>
      </q-card>
    </div>

    <div v-if="filteredUsers.length === 0" class="empty-state">
      <div class="tf-tile q-mx-auto" style="--tile-size: 64px"><q-icon name="people_outline" size="32px" /></div>
      <div class="section-title q-mt-md">{{ $t('userListPage.emptyState.title') }}</div>
      <div class="text-caption text-grey-7">{{ $t('userListPage.emptyState.subtitle') }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { peakImage } from '@/utils/badges';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import PageHeader from '@/components/PageHeader.vue';
import SegmentedToggle from '@/components/SegmentedToggle.vue';

const userStore = useUserStore();
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

// Only regular users (guides): from the user's location, or from all of Greece
const filteredUsers = computed(() => {
  let users = userStore.users.filter(u => u.role === 'user');

  if (scope.value === 'local' && myLocation.value) {
    users = users.filter(u => u.location?.id === myLocation.value.id);
  }

  // Apply name filter
  if (filterName.value) {
    const search = filterName.value.toLowerCase();
    users = users.filter(u => u.username.toLowerCase().includes(search));
  }

  return users;
});

// όλοι οι Οδηγοί· το «Το τοπικό μου» φιλτράρει από αυτούς
const fetchUsers = async () => {
  await userStore.fetchUsers({ scope: 'all' });
};

const formatUnitRole = (unitRole) => {
  if (!unitRole) return '-';
  switch(unitRole) {
    case 'leader': return t('adminUsers.roles.leader');
    case 'deputy_leader': return t('adminUsers.roles.deputyLeader');
    case 'member': return t('adminUsers.roles.member');
    default: return unitRole;
  }
};

onMounted(async () => {
  await fetchUsers();
});

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
.empty-state {
  text-align: center;
  padding: 64px 20px;
}
</style>
