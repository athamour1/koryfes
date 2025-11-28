<script setup>
import { computed } from 'vue'
import ContentEyes from './ContentEyes.vue'
import DizzyEyes from './DizzyEyes.vue'
import HappyEyes from './HappyEyes.vue'
import HeartEyes from './HeartEyes.vue'
import LeftTwitchEyes from './LeftTwitchEyes.vue'
import NormalEyes from './NormalEyes.vue'
import SimpleEyes from './SimpleEyes.vue'
import SquintEyes from './SquintEyes.vue'
import Wink from './Wink.vue'

const props = defineProps({
  type: String,
  withLashes: Boolean,
})

const eyeComponent = computed(() => {
  return {
    'content-eyes': ContentEyes,
    'dizzy-eyes': DizzyEyes,
    'happy-eyes': HappyEyes,
    'heart-eyes': HeartEyes,
    'left-twitch-eyes': LeftTwitchEyes,
    'normal-eyes': NormalEyes,
    'simple-eyes': SimpleEyes,
    'squint-eyes': SquintEyes,
    'wink': Wink,
  }[props.type]
})
</script>

<template>
  <component 
    v-if="eyeComponent !== null"
    :is="eyeComponent" 
    :with-lashes="withLashes"
  />
</template>
