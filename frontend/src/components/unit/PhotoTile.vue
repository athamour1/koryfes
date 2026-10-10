<template>
  <!-- Ένα πλακίδιο της γκαλερί: φωτογραφία (πατιέται για μεγέθυνση) ή, σε
       επεξεργασία, κενή θέση «+». Σε επεξεργασία δείχνει αλλαγή/αφαίρεση. -->
  <div class="photo-tile" :class="{ 'photo-tile--empty': !src }" :style="{ aspectRatio: ratio }">
    <img v-if="src" :src="src" :alt="$t('unitPage.viewPhoto')" loading="lazy" role="button" tabindex="0" @click="$emit('open')" @keydown.enter="$emit('open')" />
    <button v-else-if="editing" type="button" class="photo-tile__add" :disabled="busy" @click="pick">
      <q-spinner v-if="busy" size="28px" />
      <template v-else>
        <q-icon name="add_a_photo" size="28px" />
        <span>{{ $t('unitPage.addPhoto') }}</span>
      </template>
    </button>
    <div v-if="src && editing" class="photo-tile__actions">
      <q-btn v-if="replaceable" round dense size="sm" color="white" text-color="dark" icon="edit" :loading="busy" :aria-label="$t('unitPage.changePhoto')" @click="pick">
        <q-tooltip>{{ $t('unitPage.changePhoto') }}</q-tooltip>
      </q-btn>
      <q-btn round dense size="sm" color="white" text-color="negative" icon="delete" :disable="busy" :aria-label="$t('unitPage.removePhoto')" @click="$emit('remove')">
        <q-tooltip>{{ $t('unitPage.removePhoto') }}</q-tooltip>
      </q-btn>
    </div>
    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden @change="onFile" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  src: { type: String, default: null },
  editing: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  // η γωνιά αλλάζει επί τόπου· οι δράσεις μόνο αφαιρούνται
  replaceable: { type: Boolean, default: false },
  ratio: { type: String, default: '4 / 3' },
});
const emit = defineEmits(['open', 'remove', 'file']);

const input = ref(null);
const pick = () => input.value?.click();
const onFile = (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (file) emit('file', file);
};
</script>

<style scoped>
.photo-tile {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--border-soft);
  background: var(--surface-2);
}
.photo-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  display: block;
}
.photo-tile--empty {
  border-style: dashed;
}
.photo-tile__add {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: var(--klados-ink);
  font-size: 0.85rem;
}
.photo-tile__add:hover {
  background: color-mix(in srgb, var(--klados-color) 8%, transparent);
}
.photo-tile__actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
}
</style>
