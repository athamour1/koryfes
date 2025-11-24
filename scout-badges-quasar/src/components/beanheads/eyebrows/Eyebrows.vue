<script setup>
import { computed, defineProps } from "vue"
import LeftLoweredEyebrows from "./LeftLoweredEyebrows.vue";
import SeriousEyebrows from "./SeriousEyebrows.vue";
import Normal from "./Normal.vue";
import ConcernedEyebrows from "./ConcernedEyebrows.vue";
import AngryEyebrows from "./AngryEyebrows.vue";

const props = defineProps({
  type: String
})

const eyebrowsComponent = computed(() => {
  return {
    'none': null,
    'normal': Normal,
    'raised': Normal, // Use Normal for raised
    'serious': SeriousEyebrows,
    'left-lowered': LeftLoweredEyebrows,
    'angry': AngryEyebrows,
    'concerned': ConcernedEyebrows,
  }[props.type]
})
</script>

<template>
  <component 
    v-if="eyebrowsComponent !== null"
    :is="eyebrowsComponent"
  />
</template>
