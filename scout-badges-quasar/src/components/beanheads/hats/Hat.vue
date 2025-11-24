<script setup>
import Beanie from './Beanie.vue';
import Turban from './Turban.vue';
import { computed } from 'vue';

const props = defineProps({
  position: String,
  type: String,
  color: String,
  hairType: String
})

const hatComponent = computed(() => ({
  'none': null,
  'beanie': Beanie,
  'turban': Turban,
}[props.type]))
</script>

<template>
  <component
    v-if="hatComponent !== null"
    :is="hatComponent"
    :position="position"
    :color="color"
    :hair-type="hairType"
  />
</template>
