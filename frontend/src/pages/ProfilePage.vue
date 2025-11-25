<template>
  <q-page class="q-pa-md">
    <!-- Hero Header -->
    <PageHeader 
      icon="person"
      :title="$t('profilePage.title')"
      :subtitle="$t('profilePage.subtitle')"
    />

    <!-- Profile Content -->
    <div class="q-pa-md" style="max-width: 1400px; margin: 0 auto;">
      <q-card flat bordered class="rounded-borders">
        <q-card-section class="q-pa-lg">
          <!-- Two Column Layout: Avatar Left, Options Right on Desktop -->
          <!-- Stacked on Mobile -->
          <div class="row q-col-gutter-lg">
            
            <!-- LEFT COLUMN: Avatar + Randomize Button -->
            <div class="col-12 col-md-4">
              <div class="column items-center q-gutter-md">
                <!-- Avatar Preview Card -->
                <q-card flat bordered class="rounded-borders q-pa-lg">
                  <AvatarDisplay :config="avatarConfig" :size="avatarSize" />
                </q-card>
                
                <!-- Randomize Button -->
                <q-btn 
                  :label="$t('avatar.randomize')" 
                  color="secondary" 
                  outline 
                  icon="shuffle" 
                  @click="randomize" 
                  unelevated
                  class="full-width"
                />
              </div>
            </div>

            <!-- RIGHT COLUMN: Customization Options + Save Button -->
            <div class="col-12 col-md-8">
              <div class="column q-gutter-md">
                
                <!-- 1. Identity Category -->
                <q-card flat bordered class="rounded-borders">
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <q-icon name="fingerprint" size="24px" color="primary" class="q-mr-sm" />
                      <span class="text-h6 text-primary">{{ $t('avatar.identity') }}</span>
                    </div>
                    <div class="row q-col-gutter-md">
                      <!-- Gender Toggle -->
                      <div class="col-12">
                        <div class="text-caption text-grey-7 q-mb-sm">{{ $t('avatar.gender') }}</div>
                        <q-btn-toggle
                          v-model="gender"
                          toggle-color="primary"
                          :options="[
                            {label: $t('avatar.boy'), value: 'chest', icon: 'male'},
                            {label: $t('avatar.girl'), value: 'breasts', icon: 'female'}
                          ]"
                          spread
                          no-caps
                          unelevated
                        />
                      </div>
                      <!-- Skin Tone -->
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.skin"
                          :options="getOptions('skin')"
                          :label="$t('avatar.skinTone')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="palette" />
                          </template>
                        </q-select>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- 2. Face Category -->
                <q-card flat bordered class="rounded-borders">
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <q-icon name="face" size="24px" color="primary" class="q-mr-sm" />
                      <span class="text-h6 text-primary">{{ $t('avatar.face') }}</span>
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.eye"
                          :options="getOptions('eye')"
                          :label="$t('avatar.eyes')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="visibility" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.eyebrows"
                          :options="getOptions('eyebrows')"
                          :label="$t('avatar.eyebrows')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="remove" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.mouth"
                          :options="getOptions('mouth')"
                          :label="$t('avatar.mouth')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="sentiment_satisfied" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.lipColor"
                          :options="getColorOptions('lipColor')"
                          :label="$t('avatar.lipColor')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="colorize" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-toggle
                          v-model="avatarConfig.withLashes"
                          :label="$t('avatar.lashes')"
                          color="primary"
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-toggle
                          v-model="avatarConfig.faceMask"
                          :label="$t('avatar.faceMask')"
                          color="primary"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- 3. Hair Category -->
                <q-card flat bordered class="rounded-borders">
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <q-icon name="face_retouching_natural" size="24px" color="primary" class="q-mr-sm" />
                      <span class="text-h6 text-primary">{{ $t('avatar.hair') }}</span>
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.hair"
                          :options="getOptions('hair')"
                          :label="$t('avatar.hairStyle')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="face" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.hairColor"
                          :options="getColorOptions('hairColor')"
                          :label="$t('avatar.hairColor')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="palette" />
                          </template>
                        </q-select>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- 4. Headwear Category -->
                <q-card flat bordered class="rounded-borders">
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <q-icon name="checkroom" size="24px" color="primary" class="q-mr-sm" />
                      <span class="text-h6 text-primary">{{ $t('avatar.headwear') }}</span>
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.hat"
                          :options="getOptions('hat')"
                          :label="$t('avatar.hat')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="checkroom" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.hatColor"
                          :options="getColorOptions('hatColor')"
                          :label="$t('avatar.hatColor')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="palette" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="avatarConfig.accessory"
                          :options="getOptions('accessory')"
                          :label="$t('avatar.accessory')"
                          filled
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend>
                            <q-icon name="face_retouching_natural" />
                          </template>
                        </q-select>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Save Button -->
                <div class="row justify-end">
                  <q-btn 
                    :label="$t('profilePage.saveButton')" 
                    color="primary" 
                    unelevated
                    @click="updateProfile"
                    icon="save"
                    size="lg"
                    class="q-px-xl"
                    data-cy="save-profile-btn"
                  />
                </div>
                
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth';
import { useUserStore } from 'src/stores/user';
import { useQuasar } from 'quasar';
import AvatarDisplay from 'src/components/AvatarDisplay.vue';
import PageHeader from 'src/components/PageHeader.vue';

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
  withLashes: false,
  eyebrows: 'none',
  mouth: 'grin',
  lipColor: 'red',
  facialHair: 'none',
  hair: 'none',
  hairColor: 'white',
  clothing: 'shirt',
  clothingColor: 'white',
  clothingGraphic: 'none',
  accessory: 'none',
  hat: 'none',
  hatColor: 'white',
  faceMask: false,
  faceMaskColor: 'white',
  scarfColor: 'blue',
};

const avatarConfig = ref({});

// Responsive avatar size
const avatarSize = computed(() => {
  return $q.screen.lt.sm ? '160px' : '200px';
});

// Gender computed property
const gender = computed({
  get: () => avatarConfig.value.body === 'breasts' ? 'breasts' : 'chest',
  set: (val) => {
    avatarConfig.value.body = val;
  }
});

// Auto-select hair style when color changes if currently none
watch(() => avatarConfig.value.hairColor, () => {
  if (avatarConfig.value.hair === 'none') {
    avatarConfig.value.hair = 'short';
  }
});

onMounted(async () => {
  await authStore.fetchProfile();
  if (authStore.user) {
    avatarConfig.value = { ...defaultAvatarConfig, ...(authStore.user.avatarConfig || {}) };
  } else {
    avatarConfig.value = { ...defaultAvatarConfig };
  }
});

const availableOptions = {
  skin: ['light', 'yellow', 'brown', 'dark', 'red', 'black'],
  eye: ['normal-eyes', 'left-twitch-eyes', 'happy-eyes', 'content-eyes', 'squint-eyes', 'simple-eyes', 'dizzy-eyes', 'wink', 'heart-eyes'],
  eyebrows: ['none', 'raised', 'left-lowered', 'serious', 'angry', 'concerned'],
  mouth: ['grin', 'sad', 'open-smile', 'lips', 'open', 'serious', 'tongue', 'pirate-smile', 'smile'],
  hair: ['none', 'short', 'long', 'bun', 'pixie', 'balding', 'buzz', 'afro', 'bob'],
  accessory: ['none', 'round-glasses', 'tiny-glasses', 'shades'],
  hat: ['none', 'beanie', 'turban'],
  hairColor: ['white', 'blonde', 'orange', 'black', 'brown', 'blue', 'pink'],
  lipColor: ['red', 'purple', 'pink', 'turquoise', 'green'],
  hatColor: ['white', 'blue', 'black', 'green', 'red'],
};

const getOptions = (category) => {
  return availableOptions[category].map(opt => ({
    label: t(`avatar.options.${category}.${opt}`),
    value: opt
  }));
};

const getColorOptions = (category) => {
  return availableOptions[category].map(opt => ({
    label: t(`avatar.options.colors.${opt}`),
    value: opt
  }));
};

const randomize = () => {
  const newConfig = { ...avatarConfig.value };
  for (const [key, values] of Object.entries(availableOptions)) {
    if (key === 'body') continue;
    const randomIndex = Math.floor(Math.random() * values.length);
    newConfig[key] = values[randomIndex];
  }
  newConfig['withLashes'] = Math.random() < 0.5;
  newConfig['faceMask'] = Math.random() < 0.3;
  newConfig['mask'] = true;
  newConfig['clothing'] = 'shirt';
  newConfig['clothingColor'] = 'white';
  
  avatarConfig.value = newConfig;
};

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
.rounded-borders {
  border-radius: 16px;
}
</style>
