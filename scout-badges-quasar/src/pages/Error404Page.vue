<template>
  <div class="error-page flex flex-center">
    <div class="text-center q-pa-md" style="max-width: 600px">
      <div class="illustration-container q-mb-xl">
        <div class="compass-animation">
          <q-icon name="explore" size="120px" color="primary" class="compass-icon" />
        </div>
      </div>
      
      <h1 class="text-h2 text-weight-bold text-primary q-mb-md">{{ $t('error404.title') }}</h1>
      
      <p class="text-h5 text-grey-8 q-mb-lg">
        {{ $t('error404.message') }}
      </p>
      
      <div class="q-gutter-md">
        <q-btn
          to="/"
          color="primary"
          icon="home"
          :label="$t('error404.returnHome')"
          size="lg"
          unelevated
          class="action-btn"
        />
        <q-btn
          @click="$router.go(-1)"
          color="secondary"
          icon="arrow_back"
          :label="$t('error404.goBack')"
          size="lg"
          outline
          class="action-btn"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.illustration-container {
  position: relative;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.compass-animation {
  animation: float 6s ease-in-out infinite;
}

.compass-icon {
  filter: drop-shadow(0 10px 20px rgba(var(--q-primary-rgb), 0.3));
  animation: spin 8s linear infinite;
}

.action-btn {
  border-radius: 12px;
  padding: 12px 32px;
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-15deg); }
  100% { transform: rotate(0deg); }
}

/* Dark mode support */
body.body--dark .error-page {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%);
}

body.body--dark .text-grey-8 {
  color: #e0e0e0 !important;
}
</style>
