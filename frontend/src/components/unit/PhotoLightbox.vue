<template>
  <!-- Προβολή φωτογραφιών σε πλήρη οθόνη, με εναλλαγή μπρος-πίσω -->
  <q-dialog :model-value="modelValue !== null" maximized @update:model-value="(v) => !v && $emit('update:modelValue', null)">
    <div class="lightbox" @click.self="$emit('update:modelValue', null)">
      <q-btn round flat color="white" icon="close" class="lightbox__close" @click="$emit('update:modelValue', null)" />
      <q-carousel
        :model-value="modelValue"
        animated
        swipeable
        infinite
        arrows
        control-color="white"
        class="lightbox__carousel"
        @update:model-value="(i) => $emit('update:modelValue', i)"
      >
        <q-carousel-slide v-for="(src, i) in photos" :key="src" :name="i" class="lightbox__slide">
          <img :src="src" alt="" />
        </q-carousel-slide>
      </q-carousel>
    </div>
  </q-dialog>
</template>

<script setup>
defineProps({
  photos: { type: Array, required: true }, // URLs
  modelValue: { type: Number, default: null }, // index που φαίνεται, ή null
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.lightbox {
  background: rgba(0, 0, 0, 0.92);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lightbox__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}
.lightbox__carousel {
  background: transparent;
  width: 100%;
  height: 100%;
}
.lightbox__slide {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}
.lightbox__slide img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
