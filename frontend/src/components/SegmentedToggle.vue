<template>
  <!--
    Segmented control πάνω στο q-btn-toggle: ένα πλαίσιο-χάπι γύρω από τις
    επιλογές και ένα «χάπι» που γλιστρά στην ενεργή αντί να αλλάζει απότομα.
    Όλα τα props/events περνούν αυτούσια στο q-btn-toggle.
  -->
  <div class="tf-seg" :class="{ 'tf-seg--ready': ready, 'tf-seg--spread': isSpread }">
    <div ref="root" class="tf-seg__frame">
      <span class="tf-seg__thumb" :style="thumbStyle" aria-hidden="true" />
      <q-btn-toggle
        v-bind="$attrs"
        :model-value="modelValue"
        :options="options"
        no-caps
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, useAttrs } from 'vue';
import { useSlidingThumb } from '@/composables/useSlidingThumb';

defineOptions({ inheritAttrs: false });
defineProps({
  modelValue: { type: null, default: null },
  options: { type: Array, required: true },
});
const emit = defineEmits(['update:modelValue']);

const attrs = useAttrs();
const root = ref(null);
const isSpread = computed(() => 'spread' in attrs && attrs.spread !== false);
const { thumbStyle, ready } = useSlidingThumb(root, '.q-btn[aria-pressed="true"]');
</script>
