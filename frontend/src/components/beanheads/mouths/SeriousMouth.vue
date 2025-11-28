<script setup>
import { colors } from '../constants/theme.js';

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <line
    x1="446.66"
    y1="606.02"
    x2="542.53"
    y2="606.02"
    fill="none"
    :stroke="colors.outline"
    stroke-linecap="round"
    stroke-miterlimit="10"
    stroke-width="12px"
  />
</template>