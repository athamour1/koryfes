<script setup>
import { computed } from 'vue';

import Dress from './Dress.vue';
import DressShirt from './DressShirt.vue';
import Shirt from './Shirt.vue';
import TankTop from './TankTop.vue';
import VNeck from './VNeck.vue';

const props = defineProps({
  position: String,
  type: String,
  color: String,
})

const clothingComponent = computed(() => ({
  'dress': Dress,
  'dress-shirt': DressShirt,
  'shirt': Shirt,
  'tank-top': TankTop,
  'v-neck': VNeck,
  'none': null,
  'naked': null,
}[props.type]));
</script>

<template>
  <component
    v-if="clothingComponent !== null"
    :is="clothingComponent"
    :color="color"
    :position="position"
  >
    <template #graphic>
      <slot name="graphic"/>
    </template>
  </component>
</template>

