<template>
  <div class="avatar-editor">
    <!-- Preview Section -->
    <div class="preview-section">
      <div class="avatar-preview-card">
        <AvatarDisplay :config="localConfig" :size="avatarSize" />
      </div>
      <q-btn 
        :label="$t('avatar.randomize')" 
        color="secondary" 
        outline 
        icon="shuffle" 
        @click="randomize" 
        class="randomize-btn"
        unelevated
      />
    </div>

    <!-- Customization Options -->
    <div class="options-section">
      
      <!-- 1. Identity Category -->
      <div class="category-card">
        <div class="category-header">
          <q-icon name="fingerprint" size="24px" />
          <span>{{ $t('avatar.identity') }}</span>
        </div>
        <div class="options-grid">
          <!-- Gender Toggle (Replaces Body Dropdown) -->
          <div class="gender-toggle-container">
            <div class="text-caption q-mb-sm text-grey-7">{{ $t('avatar.gender') }}</div>
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
              class="gender-toggle"
            />
          </div>

          <q-select
            v-model="localConfig.skin"
            :options="getOptions('skin')"
            :label="$t('avatar.skinTone')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="palette" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- 2. Face Category -->
      <div class="category-card">
        <div class="category-header">
          <q-icon name="face" size="24px" />
          <span>{{ $t('avatar.face') }}</span>
        </div>
        <div class="options-grid">
          <q-select
            v-model="localConfig.eye"
            :options="getOptions('eye')"
            :label="$t('avatar.eyes')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="visibility" />
            </template>
          </q-select>

          <q-select
            v-model="localConfig.eyebrows"
            :options="getOptions('eyebrows')"
            :label="$t('avatar.eyebrows')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="remove" />
            </template>
          </q-select>

          <q-select
            v-model="localConfig.mouth"
            :options="getOptions('mouth')"
            :label="$t('avatar.mouth')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="sentiment_satisfied" />
            </template>
          </q-select>

          <q-select
            v-model="localConfig.lipColor"
            :options="getColorOptions('lipColor')"
            :label="$t('avatar.lipColor')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="colorize" />
            </template>
          </q-select>

          <div class="toggle-option">
            <q-toggle
              v-model="localConfig.withLashes"
              :label="$t('avatar.lashes')"
              color="primary"
              @update:model-value="updateConfig"
            />
          </div>

          <div class="toggle-option">
            <q-toggle
              v-model="localConfig.faceMask"
              :label="$t('avatar.faceMask')"
              color="primary"
              @update:model-value="updateConfig"
            />
          </div>
        </div>
      </div>

      <!-- 3. Hair Category -->
      <div class="category-card">
        <div class="category-header">
          <q-icon name="face_retouching_natural" size="24px" />
          <span>{{ $t('avatar.hair') }}</span>
        </div>
        <div class="options-grid">
          <q-select
            v-model="localConfig.hair"
            :options="getOptions('hair')"
            :label="$t('avatar.hairStyle')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="face" />
            </template>
          </q-select>

          <q-select
            v-model="localConfig.hairColor"
            :options="getColorOptions('hairColor')"
            :label="$t('avatar.hairColor')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="palette" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- 4. Headwear Category -->
      <div class="category-card">
        <div class="category-header">
          <q-icon name="checkroom" size="24px" />
          <span>{{ $t('avatar.headwear') }}</span>
        </div>
        <div class="options-grid">
          <q-select
            v-model="localConfig.hat"
            :options="getOptions('hat')"
            :label="$t('avatar.hat')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="checkroom" />
            </template>
          </q-select>

          <q-select
            v-model="localConfig.hatColor"
            :options="getColorOptions('hatColor')"
            :label="$t('avatar.hatColor')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="palette" />
            </template>
          </q-select>

          <q-select
            v-model="localConfig.accessory"
            :options="getOptions('accessory')"
            :label="$t('avatar.accessory')"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="face_retouching_natural" />
            </template>
          </q-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import AvatarDisplay from './AvatarDisplay.vue';

const { t } = useI18n();
const $q = useQuasar();

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

const localConfig = ref({ ...props.modelValue });

// Responsive avatar size
const avatarSize = computed(() => {
  return $q.screen.lt.sm ? '160px' : '240px';
});

// Gender computed property to map between 'boy'/'girl' UI and 'chest'/'breasts' data
const gender = computed({
  get: () => localConfig.value.body === 'breasts' ? 'breasts' : 'chest',
  set: (val) => {
    localConfig.value.body = val;
    updateConfig();
  }
});

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localConfig.value)) {
    localConfig.value = { ...newVal };
  }
}, { deep: true });

// Auto-select hair style when color changes if currently none
watch(() => localConfig.value.hairColor, () => {
  if (localConfig.value.hair === 'none') {
    localConfig.value.hair = 'short';
    updateConfig();
  }
});

const updateConfig = () => {
  emit('update:modelValue', localConfig.value);
};

const availableOptions = {
  skin: ['light', 'yellow', 'brown', 'dark', 'red', 'black'],
  eye: ['normal-eyes', 'left-twitch-eyes', 'happy-eyes', 'content-eyes', 'squint-eyes', 'simple-eyes', 'dizzy-eyes', 'wink', 'heart-eyes'],
  eyebrows: ['none', 'raised', 'left-lowered', 'serious', 'angry', 'concerned'],
  mouth: ['grin', 'sad', 'open-smile', 'lips', 'open', 'serious', 'tongue', 'pirate-smile', 'smile'],
  hair: ['none', 'short', 'long', 'bun', 'pixie', 'balding', 'buzz', 'afro', 'bob'],
  clothing: ['none', 'naked', 'shirt', 'dress-shirt', 'v-neck', 'tank-top', 'dress'],
  accessory: ['none', 'round-glasses', 'tiny-glasses', 'shades'],
  hat: ['none', 'beanie', 'turban'],
  // body options are now handled by gender toggle, but kept here for reference if needed
  body: ['chest', 'breasts'],
  hairColor: ['white', 'blonde', 'orange', 'black', 'brown', 'blue', 'pink'],
  clothingColor: ['white', 'blue', 'black', 'green', 'red'],
  lipColor: ['red', 'purple', 'pink', 'turquoise', 'green'],
  hatColor: ['white', 'blue', 'black', 'green', 'red'],
  scarfColor: ['blue', 'green', 'yellow', 'dark-blue', 'turquoise', 'red'], // Guide scarf colors
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
  const newConfig = { ...localConfig.value }; // Start with current config to preserve body
  for (const [key, values] of Object.entries(availableOptions)) {
    if (key === 'body') continue; // Skip body/gender randomization
    if (key === 'clothing' || key === 'clothingColor') continue; // Skip clothing randomization
    const randomIndex = Math.floor(Math.random() * values.length);
    newConfig[key] = values[randomIndex];
  }
  // Randomize booleans
  newConfig['withLashes'] = Math.random() < 0.5;
  newConfig['faceMask'] = Math.random() < 0.3; // Less likely
  newConfig['mask'] = true; // Always show circle mask
  
  // Force white shirt as default
  newConfig['clothing'] = 'shirt';
  newConfig['clothingColor'] = 'white';
  
  localConfig.value = newConfig;
  updateConfig();
};
</script>

<style scoped>
.avatar-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

/* Preview Section */
.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

body.body--dark .preview-section {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.avatar-preview-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 280px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

body.body--dark .avatar-preview-card {
  background: #1d1d1d;
  border-color: rgba(255, 255, 255, 0.1);
}

.randomize-btn {
  font-weight: 600;
  padding: 12px 32px;
  border-radius: 12px;
  border: 2px solid currentColor;
  transition: all 0.3s;
}

.randomize-btn:hover {
  transform: scale(1.05);
}

/* Options Section */
.options-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
  overflow-y: auto;
  max-height: none;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

body.body--dark .options-section {
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.category-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

body.body--dark .category-card {
  background: #1d1d1d;
  border-color: rgba(255, 255, 255, 0.1);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--q-primary);
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

body.body--dark .category-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.toggle-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

body.body--dark .toggle-option {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.scarf-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(var(--q-primary-rgb), 0.05);
  border-radius: 12px;
  border: 1px solid rgba(var(--q-primary-rgb), 0.1);
}

.full-width {
  grid-column: 1 / -1;
}

.gender-toggle-container {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
}

.gender-toggle {
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
}

body.body--dark .gender-toggle {
  border-color: rgba(255,255,255,0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .options-grid {
    /* Allow 2 columns on mobile if space permits */
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .avatar-preview-card {
    padding: 16px;
    min-width: auto;
    width: auto; /* Allow it to shrink */
  }

  .preview-section {
    padding: 12px;
    gap: 12px;
  }

  .options-section {
    padding: 12px;
    gap: 12px;
  }

  .category-card {
    padding: 16px;
  }

  .randomize-btn {
    width: 100%;
    padding: 8px 16px;
  }
}
</style>
