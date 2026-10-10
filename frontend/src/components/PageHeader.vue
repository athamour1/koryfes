<template>
  <!-- Κεφαλίδα σελίδας: λιτή, μέσα στη σελίδα (όχι banner) — εικονίδιο σε
       απαλό πλακίδιο στο χρώμα του κλάδου, τίτλος, υπότιτλος και ενέργειες
       δεξιά που πέφτουν από κάτω όταν δεν χωρούν. -->
  <div class="page-header tf-toolbar">
    <div class="page-header__main">
      <div v-if="icon" class="page-header__icon">
        <q-icon :name="icon" size="24px" />
      </div>
      <div class="page-header__text">
        <h1 class="page-title">{{ title }}</h1>
        <div v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</div>
      </div>
    </div>
    <div v-if="$slots.extra" class="tf-actions page-header__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: null
  }
});
</script>

<style scoped>
.page-header {
  padding: 16px 0 16px;
}
.page-header__main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.page-header__icon {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: var(--klados-ink);
  background: color-mix(in srgb, var(--klados-color) 14%, transparent);
}
.page-header__text {
  min-width: 0;
}
.page-title {
  margin: 0;
  overflow-wrap: anywhere;
}
.page-header__subtitle {
  margin-top: 2px;
  color: var(--muted);
  font-size: 0.92rem;
}
.page-header__extra {
  flex: 1 1 280px;
}
@media (max-width: 599px) {
  .page-header {
    padding: 12px 0 10px;
  }
  .page-title {
    font-size: 1.35rem;
  }
}
</style>
