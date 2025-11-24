<script setup>
import { computed } from 'vue';
import Afro from './Afro.vue';
import BaldingHair from './BaldingHair.vue';
import BobCut from './BobCut.vue';
import BunHair from './BunHair.vue';
import BuzzCut from './BuzzCut.vue';
import LongHair from './LongHair.vue';
import PixieCut from './PixieCut.vue';
import ShortHair from './ShortHair.vue';

const props = defineProps({
  position: String,
  type: String,
  color: String,
  hasHat: Boolean,
});

const hairComponent = computed(() => {
  return {
    'none': null,
    'afro': Afro,
    'balding': BaldingHair,
    'bob': BobCut,
    'bun': BunHair,
    'buzz': BuzzCut,
    'long': LongHair,
    'pixie': PixieCut,
    'short': ShortHair,
  }[props.type];
})
</script>

<template>
  <component
    v-if="hairComponent !== null"
    :is="hairComponent"
    :position="position"
    :color="color"
    :has-hat="hasHat"
  />
</template>
