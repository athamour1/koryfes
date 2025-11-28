<script setup>
import { computed } from 'vue';
import RoundGlasses from './RoundGlasses.vue';
import TinyGlasses from './TinyGlasses.vue';
import Shades from './Shades.vue';



const props = defineProps({
  type: String,
});

const accessoryComponent = computed(() => {
  return {
    'none': null,
    'round-glasses': RoundGlasses,
    'tiny-glasses': TinyGlasses,
    'shades': Shades,
  }[props.type];
});
</script>

<template>
  <component 
    v-if="accessoryComponent !== null"
    :is="accessoryComponent"
  />
</template>
