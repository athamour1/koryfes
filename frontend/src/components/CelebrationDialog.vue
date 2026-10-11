<template>
  <!-- Γιορτή για νέο ορόσημο: κομφετί, το σήμα του και ένα μήνυμα -->
  <q-dialog :model-value="!!celebration" @hide="$emit('done')">
    <q-card v-if="celebration" class="celebration">
      <q-card-section class="column items-center text-center q-pt-lg">
        <img v-if="celebration.image" :src="celebration.image" :alt="celebration.name" class="celebration__badge" />
        <div class="celebration__title q-mt-md">{{ title }}</div>
        <div class="text-body1 text-grey-8 q-mt-sm celebration__message">{{ message }}</div>
      </q-card-section>
      <q-card-actions align="center" class="q-pb-lg">
        <q-btn color="primary" unelevated no-caps size="md" :label="$t('celebrations.continue')" v-close-popup autofocus />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import confetti from 'canvas-confetti'

const props = defineProps({
  celebration: { type: Object, default: null }, // { key, kind, image, name }
})
defineEmits(['done'])

const { t } = useI18n()

const title = computed(() => t(`celebrations.${props.celebration?.kind}.title`, { name: props.celebration?.name }))
const message = computed(() => t(`celebrations.${props.celebration?.kind}.message`, { name: props.celebration?.name }))

// τα χρώματα του ΣΕΟ: μπλε του κλάδου, κίτρινο του Τριφυλλιού, λευκό
const COLORS = ['#0094da', '#3fb0e6', '#f5c400', '#ffe27a', '#ffffff']

const burst = () => {
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 9999 }
  confetti({ ...base, particleCount: 120, spread: 80, startVelocity: 45, origin: { y: 0.6 } })
  setTimeout(() => {
    confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } })
    confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } })
  }, 250)
}

watch(() => props.celebration?.key, (key) => {
  if (key) burst()
}, { immediate: true })
</script>

<style scoped>
.celebration {
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
}
.celebration__badge {
  width: 150px;
  height: 150px;
  object-fit: contain;
  filter: drop-shadow(0 8px 18px rgba(16, 22, 28, 0.22));
  animation: celebration-pop 600ms var(--ease-emphasized, cubic-bezier(0.2, 0, 0, 1)) both;
}
.celebration__title {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.celebration__message {
  line-height: 1.5;
}
@keyframes celebration-pop {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .celebration__badge { animation: none; }
}
</style>
