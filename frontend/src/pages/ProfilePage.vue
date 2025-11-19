<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Profile Settings</div>
    <q-card style="max-width: 400px">
        <q-card-section>
          <div class="text-h6">Profile Settings</div>
        </q-card-section>

        <q-card-section class="text-center">
          <q-avatar size="100px" class="q-mb-md">
            <img :src="profileImage" style="object-fit: cover" />
          </q-avatar>
          <q-file
            v-model="imageFile"
            label="Upload Profile Image"
            outlined
            dense
            accept=".jpg, .png, .jpeg"
            @update:model-value="uploadImage"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-section>
          <q-input v-model="location" label="Location" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Save Location" color="primary" @click="updateProfile" />
        </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { useQuasar } from 'quasar';

const authStore = useAuthStore();
const userStore = useUserStore();
const location = ref('');
const imageFile = ref(null);
const $q = useQuasar();

const profileImage = computed(() => {
  if (authStore.user && authStore.user.profileImage) {
    return `http://localhost:3000${authStore.user.profileImage}`;
  }
  return 'https://cdn.quasar.dev/img/boy-avatar.png';
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
    $q.notify({ color: 'positive', message: 'Profile updated' });
    await authStore.fetchProfile();
  } else {
    $q.notify({ color: 'negative', message: 'Update failed' });
  }
};

const uploadImage = async (file) => {
  if (file) {
    const success = await userStore.uploadProfileImage(file);
    if (success) {
      $q.notify({ color: 'positive', message: 'Image uploaded' });
      await authStore.fetchProfile();
      imageFile.value = null;
    } else {
      $q.notify({ color: 'negative', message: 'Upload failed' });
    }
  }
};
</script>
