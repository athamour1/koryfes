<template>
  <div class="avatar-display" :style="{ width: size, height: size }">
    <Avatar v-bind="avatarConfig" />
  </div>
</template>

<script setup>
import Avatar from './beanheads/Avatar.vue';
import { computed } from 'vue';

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  },
  size: {
    type: String,
    default: '100%'
  }
});

// Default configuration matching Avatar component props
const defaultConfig = {
  mask: false, // Changed to false to show full avatar without circular mask
  skin: 'light',
  body: 'chest',
  braStraps: true,
  eye: 'normal-eyes',
  withLashes: false, // Lashes default to false
  eyebrows: 'none',
  mouth: 'grin',
  lipColor: 'red',
  facialHair: 'none',
  hair: 'none',
  hairColor: 'white',
  clothing: 'shirt',
  clothingColor: 'white',
  clothingGraphic: 'none',
  accessory: 'none',
  hat: 'none',
  hatColor: 'white',
  faceMask: false,
  faceMaskColor: 'white',
  scarfColor: 'blue', // Guide scarf color
};

// Merge user config with defaults
const avatarConfig = computed(() => {
  return { ...defaultConfig, ...props.config };
});
</script>

<style scoped>
.avatar-display {
  display: inline-block;
  overflow: hidden;
}
</style>
