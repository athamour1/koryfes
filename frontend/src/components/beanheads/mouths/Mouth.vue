<script setup>
import { computed } from 'vue';

import Grin from './Grin.vue';
import OpenMouth from './OpenMouth.vue';
import Sad from './Sad.vue';
import SeriousMouth from './SeriousMouth.vue';
import Tongue from './Tongue.vue';
import Lips from './Lips.vue';
import SmileOpen from './SmileOpen.vue';

const props = defineProps({
  type: String,
  color: String,
})

const mouthComponent = computed(() => {
  return {
    'grin': Grin,
    'lips': Lips,
    'sad': Sad,
    'serious': SeriousMouth,
    'open': OpenMouth,
    'tongue': Tongue,
    'open-smile': SmileOpen,
    'smile': SmileOpen, // Use same component
    'pirate-smile': Grin, // Use Grin for pirate smile
  }[props.type];
})

</script>

<template>
  <component 
    v-if="mouthComponent !== null"
    :is="mouthComponent" 
    :color="color"
  />
</template>