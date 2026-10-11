<template>
  <!-- Γραμμή-σκελετός πίνακα: κάθε στήλη με το σχήμα του περιεχομένου της
       (column.skeleton: 'avatar' | 'chip' | 'actions', αλλιώς κείμενο) -->
  <q-tr>
    <q-td v-for="col in cols" :key="col.name" :class="`text-${col.align || 'left'}`">
      <q-skeleton v-if="col.skeleton === 'avatar'" type="QAvatar" size="40px" class="inline-block" />
      <q-skeleton v-else-if="col.skeleton === 'chip'" type="QChip" width="96px" height="24px" class="inline-block" />
      <div v-else-if="col.skeleton === 'actions'" class="row justify-end no-wrap q-gutter-x-sm">
        <q-skeleton v-for="n in 3" :key="n" type="circle" size="28px" />
      </div>
      <q-skeleton v-else type="text" :width="textWidth" class="inline-block" />
    </q-td>
  </q-tr>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  cols: { type: Array, required: true },
  // για να μη βγαίνουν όλες οι γραμμές ίδιες
  index: { type: Number, default: 0 },
});

const textWidth = computed(() => `${[70, 55, 85, 60, 75][props.index % 5]}%`);
</script>
