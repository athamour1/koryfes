<template>
  <q-page class="tf-page user-profile-page">
    <div class="q-pt-md q-pb-sm">
      <q-btn flat dense no-caps icon="arrow_back" :label="$t('general.back')" color="primary" @click="$router.back()" />
    </div>

    <!-- Καρτέλα μέλους -->
    <q-card v-if="user" flat bordered class="q-mb-lg">
      <q-card-section class="row items-center no-wrap q-gutter-md">
        <div class="profile-avatar">
          <AvatarDisplay :config="user.avatarConfig" size="96px" />
        </div>
        <div class="col">
          <h1 class="page-title">{{ user.username }}</h1>
          <div class="row items-center q-gutter-xs q-mt-xs">
            <q-chip
              dense
              square
              :clickable="!!user.location"
              color="grey-2"
              text-color="grey-9"
              icon="place"
              @click="user.location && $router.push(`/locations/${user.location.id}`)"
            >
              {{ user.location?.name || $t('userProfilePage.noLocation') }}
            </q-chip>
            <q-chip
              v-if="!isAdmin && user.unit"
              dense
              square
              clickable
              color="grey-2"
              text-color="grey-9"
              icon="groups"
              @click="$router.push(`/units/${user.unit.id}`)"
            >
              {{ user.unit.name }}
            </q-chip>
            <q-chip
              v-if="!isAdmin && user.unit && user.unitRole"
              dense
              square
              :color="user.unitRole === 'member' ? 'grey-2' : 'primary'"
              :text-color="user.unitRole === 'member' ? 'grey-9' : 'white'"
            >
              {{ formatUnitRole(user.unitRole) }}
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Ατομική πρόοδος -->
    <template v-if="user && !isAdmin">
      <div class="tf-card-head"><q-icon name="trending_up" />{{ $t('progress.title') }}</div>
      <ProgressOverview :progress="user.progress" :peaks="progressStore.peaks" />
    </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '@/api';
import { date } from 'quasar';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import ProgressOverview from '@/components/progress/ProgressOverview.vue';
import { useProgressStore } from '@/stores/progress';

const route = useRoute();
const router = useRouter();
const progressStore = useProgressStore();
const { t } = useI18n();
const user = ref(null);

// Check if the user being displayed is an admin or super admin
const isAdmin = computed(() => {
  return user.value?.role === 'admin' || user.value?.role === 'super_admin';
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return date.formatDate(dateString, 'MMM D, YYYY');
};

const fetchUserProfile = async () => {
  try {
    const userId = route.params.id;
    const response = await api.get(`/users/${userId}`);
    
    if (!response.data) {
      router.push('/users');
      return;
    }

    // Οι Οδηγοί όλων των τοπικών φαίνονται στην «Κοινότητα» (Όλη η Ελλάδα),
    // οπότε και το προφίλ τους ανοίγει για όλους (μόνο για ανάγνωση)
    user.value = response.data;
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    router.push('/users');
  }
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

onMounted(() => {
  fetchUserProfile();
  progressStore.fetchCatalog();
});

onBeforeUnmount(() => {
  // Clean up user data before component unmounts
  user.value = null;
});
</script>

<style scoped>
.profile-avatar {
  flex: 0 0 auto;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--klados-color) 10%, var(--surface));
  border: 1px solid var(--border-soft);
}
.page-title {
  margin: 0;
}
</style>
