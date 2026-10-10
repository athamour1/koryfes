<template>
  <q-page class="tf-page">
    <!-- Hero Header -->
    <PageHeader 
      icon="person"
      :title="$t('profilePage.title')"
      :subtitle="$t('profilePage.subtitle')"
    />

    <!-- Profile Content -->
    <div class="profile-body">
      <q-card flat bordered>
        <q-card-section>
          <!-- Custom Flex Layout: Column on Mobile, Row on Desktop -->
          <div class="profile-container fit">
            
            <!-- LEFT COLUMN: Avatar + Randomize Button -->
            <div class="profile-left column">
              <div class="column items-center q-gutter-sm">
                <!-- Avatar Preview Card -->
                <q-card flat bordered class="q-pa-md avatar-preview">
                  <AvatarDisplay :config="avatarConfig" :size="avatarSize" />
                </q-card>
                
                <!-- Randomize Button -->
                <q-btn
                  :label="$t('avatar.randomize')"
                  color="primary"
                  flat
                  no-caps
                  icon="shuffle"
                  @click="randomize"
                />
              </div>
            </div>

            <!-- RIGHT COLUMN: Customization Options + Save Button -->
            <div class="profile-right column no-wrap">
              <!-- Scrollable Options Area -->
              <div>
                <div class="column">
                  
                  <!-- 1. Identity Category -->
                  <q-card flat bordered class="q-mb-sm">
                    <q-card-section class="q-pa-sm">
                      <div class="tf-card-head"><q-icon name="fingerprint" />{{ $t('avatar.identity') }}</div>
                      <div class="row q-col-gutter-sm">
                        <!-- Gender Toggle -->
                        <div class="col-12">
                          <div class="text-caption text-grey-7 q-mb-xs">{{ $t('avatar.gender') }}</div>
                          <SegmentedToggle
                            v-model="gender"
                            :options="[
                              {label: $t('avatar.boy'), value: 'chest', icon: 'male'},
                              {label: $t('avatar.girl'), value: 'breasts', icon: 'female'}
                            ]"
                            spread
                            dense
                          />
                        </div>
                        <!-- Skin Tone -->
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.skin"
                            :options="getOptions('skin')"
                            :label="$t('avatar.skinTone')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="palette" size="xs" />
                            </template>
                          </q-select>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- 2. Face Category -->
                  <q-card flat bordered class="q-mb-sm">
                    <q-card-section class="q-pa-sm">
                      <div class="tf-card-head"><q-icon name="face" />{{ $t('avatar.face') }}</div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.eye"
                            :options="getOptions('eye')"
                            :label="$t('avatar.eyes')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="visibility" size="xs" />
                            </template>
                          </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.eyebrows"
                            :options="getOptions('eyebrows')"
                            :label="$t('avatar.eyebrows')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="remove" size="xs" />
                            </template>
                          </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.mouth"
                            :options="getOptions('mouth')"
                            :label="$t('avatar.mouth')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="sentiment_satisfied" size="xs" />
                            </template>
                          </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.lipColor"
                            :options="getColorOptions('lipColor')"
                            :label="$t('avatar.lipColor')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="colorize" size="xs" />
                            </template>
                          </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-toggle
                            v-model="avatarConfig.withLashes"
                            :label="$t('avatar.lashes')"
                            color="primary"
                            dense
                          />
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-toggle
                            v-model="avatarConfig.faceMask"
                            :label="$t('avatar.faceMask')"
                            color="primary"
                            dense
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- 3. Hair Category -->
                  <q-card flat bordered class="q-mb-sm">
                    <q-card-section class="q-pa-sm">
                      <div class="tf-card-head"><q-icon name="face_retouching_natural" />{{ $t('avatar.hair') }}</div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.hair"
                            :options="getOptions('hair')"
                            :label="$t('avatar.hairStyle')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="face" size="xs" />
                            </template>
                          </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.hairColor"
                            :options="getColorOptions('hairColor')"
                            :label="$t('avatar.hairColor')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="palette" size="xs" />
                            </template>
                          </q-select>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- 4. Headwear Category -->
                  <q-card flat bordered class="q-mb-sm">
                    <q-card-section class="q-pa-sm">
                      <div class="tf-card-head"><q-icon name="checkroom" />{{ $t('avatar.headwear') }}</div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.hat"
                            :options="getOptions('hat')"
                            :label="$t('avatar.hat')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="checkroom" size="xs" />
                            </template>
                          </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.hatColor"
                            :options="getColorOptions('hatColor')"
                            :label="$t('avatar.hatColor')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="palette" size="xs" />
                            </template>
                          </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="avatarConfig.accessory"
                            :options="getOptions('accessory')"
                            :label="$t('avatar.accessory')"
                            outlined
                            dense
                            emit-value
                            map-options
                            options-dense
                          >
                            <template v-slot:prepend>
                              <q-icon name="face_retouching_natural" size="xs" />
                            </template>
                          </q-select>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Save Button -->
              <div class="row justify-end q-pt-md save-row">
                <q-btn 
                  :label="$t('profilePage.saveButton')" 
                  color="primary" 
                  unelevated
                  @click="updateProfile"
                  icon="save"
                  size="md"
                  class="q-px-lg"
                  data-cy="save-profile-btn"
                  compact
                />
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
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import PageHeader from '@/components/PageHeader.vue';
import SegmentedToggle from '@/components/SegmentedToggle.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const $q = useQuasar();
const { t } = useI18n();

// Default avatar configuration
const defaultAvatarConfig = {
  mask: false,
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
  newConfig['mask'] = false;
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
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.profile-right {
  flex: 1;
  min-width: 0;
}
.avatar-preview {
  background: color-mix(in srgb, var(--klados-color) 6%, var(--surface));
}
/* Το κουμπί αποθήκευσης μένει ορατό όσο κυλάς τις επιλογές. */
.save-row {
  position: sticky;
  bottom: 0;
  padding-bottom: 4px;
  background: linear-gradient(to top, var(--surface) 70%, transparent);
}
@media (min-width: 1024px) {
  .profile-container {
    flex-direction: row;
    align-items: flex-start;
  }
  /* Η προεπισκόπηση μένει στη θέση της όσο κυλάς τις επιλογές. */
  .profile-left {
    width: 33.3333%;
    position: sticky;
    top: 0;
  }
  .profile-right {
    width: 66.6666%;
  }
}
</style>
