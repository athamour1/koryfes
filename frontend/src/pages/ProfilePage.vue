<template>
  <q-page class="profile-page column no-wrap" style="height: calc(100vh - 50px); overflow: hidden;">
    <!-- Hero Header -->
    <div class="profile-header-wrapper col-auto">
      <div class="gradient-purple text-white profile-header-content" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1400px; margin: 0 auto;">
        <div class="text-center" style="max-width: 600px; margin: 0 auto;">
          <q-icon name="person" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold">{{ $t('profilePage.title') }}</div>
          <div class="text-body1" style="opacity: 0.9;">{{ $t('profilePage.subtitle') }}</div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="profile-content-wrapper col column" style="max-width: 1200px; margin: 0 auto; width: 100%; overflow: hidden;">
      <q-card class="profile-card col column" flat bordered>

        <!-- Avatar Editor Section -->
        <q-card-section class="avatar-section col column" style="overflow: hidden; padding: 0;">
          <AvatarEditor v-model="avatarConfig" class="fit" />
        </q-card-section>

        <q-separator />

        <!-- Actions -->
        <q-card-actions class="q-pa-lg col-auto" align="right">
          <q-btn 
            :label="$t('profilePage.saveButton')" 
            color="primary" 
            unelevated
            @click="updateProfile"
            icon="save"
            class="save-btn"
            size="md"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth';
import { useUserStore } from 'src/stores/user';
import { useQuasar } from 'quasar';
import AvatarEditor from 'src/components/AvatarEditor.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const $q = useQuasar();
const { t } = useI18n();

// Default avatar configuration
const defaultAvatarConfig = {
  mask: true,
  skin: 'light',
  body: 'chest',
  braStraps: true,
  eye: 'normal-eyes',
  withLashes: false, // Lashes default to false
  eyebrows: 'none',
  mouth: 'grin',
  lipColor: 'red',
  facialHair: 'none',
  hair: 'none',
  hairColor: 'white',
  clothing: 'none',
  clothingColor: 'white',
  clothingGraphic: 'none',
  accessory: 'none',
  hat: 'none',
  hatColor: 'white',
  faceMask: false,
  faceMaskColor: 'white',
  scarfColor: 'blue', // Scout scarf color
};

const avatarConfig = ref({});

onMounted(async () => {
  await authStore.fetchProfile();
  if (authStore.user) {
    // Merge saved config with defaults to ensure all properties exist
    avatarConfig.value = { ...defaultAvatarConfig, ...(authStore.user.avatarConfig || {}) };
  } else {
    // Use defaults if no user
    avatarConfig.value = { ...defaultAvatarConfig };
  }
});

const updateProfile = async () => {
  const success = await userStore.updateProfile({ 
    avatarConfig: avatarConfig.value
  });
  
  if (success) {
    $q.notify({ 
      color: 'positive', 
      message: t('profilePage.notifications.updateSuccess'),
      icon: 'check_circle',
      position: 'top'
    });
    await authStore.fetchProfile();
  } else {
    $q.notify({ 
      color: 'negative', 
      message: t('profilePage.notifications.updateError'),
      icon: 'error',
      position: 'top'
    });
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 0%, transparent 300px);
}

body.body--dark .profile-page {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 0%, transparent 300px);
}

.gradient-purple {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
}

.profile-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

body.body--dark .profile-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.card-header {
  background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.05) 0%, rgba(var(--q-secondary-rgb), 0.05) 100%);
  padding: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-section {
  padding: 32px;
  background: rgba(0, 0, 0, 0.01);
}

body.body--dark .avatar-section {
  background: rgba(255, 255, 255, 0.01);
}

.save-btn {
  font-weight: 600;
  padding: 12px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.3);
  transition: all 0.3s;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--q-primary-rgb), 0.4);
}

/* Responsive Padding Classes */
.profile-header-wrapper {
  padding: 16px;
}

.profile-header-content {
  padding: 24px;
}

.profile-content-wrapper {
  padding: 0 24px 24px 24px;
}

@media (max-width: 768px) {
  .avatar-section {
    padding: 0; /* Remove padding on mobile to let AvatarEditor handle it */
  }

  .save-btn {
    width: 100%;
  }

  .profile-header-wrapper {
    display: none;
  }

  .profile-content-wrapper {
    padding: 0 12px 12px 12px;
  }
  
  .text-h4 {
    font-size: 1.5rem;
  }
}
</style>
