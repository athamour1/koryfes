<script setup>
import { computed } from "vue";
import Stubble from "./Stubble.vue";
import MediumBeard from "./MediumBeard.vue";

const props = defineProps({
  type: String,
  color: String,
})

const facialHairComponent = computed(() => {
  return {
    'none': null,
    'stubble': Stubble,
    'medium-beard': MediumBeard
  }[props.type]
})
</script>

<template>
  <component 
    v-if="facialHairComponent !== null"
    :is="facialHairComponent" 
    :color="color" 
  />
</template>
