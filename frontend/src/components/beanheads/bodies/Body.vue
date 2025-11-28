<script setup>

import Breasts from './Breasts.vue';
import Chest from './Chest.vue';
import { computed } from 'vue';

const props = defineProps({
  type: String,
  color: String,
  position: String,
  braStraps: Boolean,
});

const bodyComponent = computed(() => {
  return {
    'chest': Chest,
    'breasts': Breasts,
  }[props.type];
});
</script>

<template>
  <component 
    v-if="bodyComponent !== null"
    :is="bodyComponent"
    :color="color"
    :position="position"
    :bra-straps="braStraps"
  />
</template>
