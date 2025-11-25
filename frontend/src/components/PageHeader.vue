<template>
  <div class="page-header-wrapper">
    <div class="page-header-content gradient-purple text-white">
      <div class="text-center page-header-inner">
        <q-icon v-if="icon" :name="icon" size="32px" class="q-mb-xs" />
        <div class="page-header-title">{{ title }}</div>
        <div v-if="subtitle" class="page-header-subtitle">{{ subtitle }}</div>
        <slot name="extra"></slot>
      </div>
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
.page-header-wrapper {
  padding: 16px;
  margin-bottom: 0;
}

.page-header-content {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  border-radius: 12px;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.page-header-inner {
  max-width: 800px;
  margin: 0 auto;
}

.page-header-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
}

/* Mobile styles */
@media (max-width: 768px) {
  .page-header-content {
    padding: 12px;
  }

  .page-header-title {
    font-size: 1.25rem;
  }

  .page-header-subtitle {
    font-size: 0.875rem;
  }

  .page-header-wrapper :deep(.q-icon) {
    font-size: 24px !important;
  }
}
</style>
