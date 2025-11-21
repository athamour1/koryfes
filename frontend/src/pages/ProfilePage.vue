<template>
  <q-page class="profile-page">
    <!-- Hero Header -->
    <div class="gradient-purple text-white q-pa-lg">
      <div class="text-center" style="max-width: 600px; margin: 0 auto;">
        <q-icon name="person" size="48px" class="q-mb-sm" />
        <div class="text-h4 text-weight-bold">{{ $t('profilePage.title') }}</div>
        <div class="text-body1" style="opacity: 0.9;">{{ $t('profilePage.subtitle') }}</div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="q-pa-lg" style="max-width: 600px; margin: 0 auto;">
      <q-card class="q-mt-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="account_circle" class="q-mr-sm" />
            {{ $t('profilePage.infoTitle') }}
          </div>
        </q-card-section>

        <!-- Profile Image Section -->
        <q-card-section class="text-center bg-grey-1">
          <q-avatar 
            size="120px" 
            class="q-mb-md"
          >
            <img :src="profileImage" style="object-fit: cover" />
          </q-avatar>
          
          <div>
            <q-file
              v-model="imageFile"
              :label="$t('profilePage.uploadImage')"
              filled
              dense
              accept=".jpg, .png, .jpeg"
              @update:model-value="uploadImage"
              class="q-mt-md"
              style="max-width: 300px; margin: 0 auto;"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Location Section -->
        <q-card-section>
          <q-input 
            v-model="location" 
            :label="$t('profilePage.location')" 
            filled 
            dense
            :hint="$t('profilePage.locationHint')"
          >
            <template v-slot:prepend>
              <q-icon name="location_on" />
            </template>
          </q-input>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn 
            :label="$t('profilePage.saveButton')" 
            color="primary" 
            unelevated
            @click="updateProfile"
            icon="save"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { useQuasar } from 'quasar';
import { config } from '../config';
import { getAvatarUrl } from '../utils/avatar';

const authStore = useAuthStore();
const userStore = useUserStore();
const location = ref('');
const imageFile = ref(null);
const $q = useQuasar();
const { t } = useI18n();

const profileImage = computed(() => {
  return getAvatarUrl(authStore.user?.username, authStore.user?.profileImage);
});

onMounted(async () => {
  await authStore.fetchProfile();
  if (authStore.user) {
    location.value = authStore.user.location;
  }
});

const updateProfile = async () => {
  const success = await userStore.updateProfile({ location: location.value });
  if (success) {
    $q.notify({ color: 'positive', message: t('profilePage.notifications.updateSuccess') });
    await authStore.fetchProfile();
  } else {
    $q.notify({ color: 'negative', message: t('profilePage.notifications.updateError') });
  }
};

const uploadImage = async (file) => {
  if (file) {
    const success = await userStore.uploadProfileImage(file);
    if (success) {
      $q.notify({ color: 'positive', message: t('profilePage.notifications.imageSuccess') });
      await authStore.fetchProfile();
      imageFile.value = null;
    } else {
      $q.notify({ color: 'negative', message: t('profilePage.notifications.imageError') });
    }
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
}

body.body--dark .bg-grey-1 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
</style>
