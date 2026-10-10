<template>
  <!-- Φίλτρα σε μία γραμμή όσο χωράνε· όταν θα έσπαγαν γραμμή, μαζεύονται
       σε ένα κουμπί «Φίλτρα» που ανοίγει μενού με τα ίδια πεδία. -->
  <div ref="root" class="filter-bar" :class="{ 'filter-bar--collapsed': collapsed }">
    <!-- κρυφό αντίγραφο σε μία γραμμή, μόνο για να ξέρουμε πόσο πλάτος θέλει -->
    <div class="filter-bar__measure" aria-hidden="true" inert>
      <div ref="measure" class="filter-bar__inline">
        <slot :in-menu="false" />
      </div>
    </div>

    <div v-if="!collapsed" class="filter-bar__inline">
      <slot :in-menu="false" />
    </div>
    <q-btn
      v-else
      outline
      no-caps
      icon="tune"
      :label="$t('general.filters')"
    >
      <q-badge v-if="activeCount" color="primary" floating rounded>{{ activeCount }}</q-badge>
      <q-menu anchor="bottom left" self="top left" :offset="[0, 6]">
        <div class="filter-bar__menu column">
          <slot :in-menu="true" />
        </div>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

defineProps({
  // πόσα φίλτρα είναι ενεργά, για το σήμα στο κουμπί
  activeCount: {
    type: Number,
    default: 0
  }
});

const root = ref(null);
const measure = ref(null);
const collapsed = ref(false);
let observer = null;

const update = () => {
  if (!root.value || !measure.value) return;
  collapsed.value = measure.value.offsetWidth > root.value.clientWidth;
};

onMounted(() => {
  observer = new ResizeObserver(update);
  observer.observe(root.value);
  observer.observe(measure.value);
  update();
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
.filter-bar {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
}
.filter-bar--collapsed {
  /* μεγαλώνει για να μετράει τον ελεύθερο χώρο, αλλά όχι κάτω από το κουμπί */
  min-width: fit-content;
}
.filter-bar__measure {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}
.filter-bar__inline {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  width: max-content;
}
/* στη γραμμή κρατάνε το πλάτος τους και στο κινητό (εκεί μαζεύονται στο μενού) */
.filter-bar__inline :deep(.filter-select) {
  min-width: 140px;
  width: auto;
}
.filter-bar__menu {
  gap: 12px;
  padding: 12px;
  width: 280px;
  max-width: 90vw;
}
.filter-bar__menu :deep(.filter-select) {
  width: 100%;
  min-width: 0;
}
</style>
