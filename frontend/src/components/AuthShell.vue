<template>
  <q-page class="auth-shell column items-center justify-center">
    <!-- Οθόνες χωρίς συνεδρία (σύνδεση, ξεχασμένος/επαναφορά κωδικού): ίδιο
         λογότυπο, ίδια τυπογραφία, μία ήρεμη κάρτα στο κέντρο. -->
    <div class="auth-shell__brand column items-center tf-rise">
      <div class="auth-shell__logo">
        <img :src="logo" alt="" />
      </div>
      <div class="auth-shell__name">{{ $t('auth.brand.name') }}</div>
    </div>

    <q-card flat bordered class="auth-shell__card">
      <q-card-section v-if="title" class="q-pb-none">
        <div class="text-h6 text-weight-bold">{{ title }}</div>
        <div v-if="subtitle" class="text-body2 text-grey-7">{{ subtitle }}</div>
      </q-card-section>
      <q-card-section>
        <slot />
      </q-card-section>
      <slot name="footer" />
    </q-card>
  </q-page>
</template>

<script setup>
import logo from '@/assets/promise.png';

defineProps({
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
});
</script>

<style scoped>
.auth-shell {
  padding: 24px 16px;
  gap: 20px;
}
/* Χωρίς μπάρα και συρτάρι, η σελίδα δεν χρειάζεται να είναι «κάρτα». */
.q-page-container > .q-page.auth-shell {
  background: transparent;
  border: 0;
  box-shadow: none;
}
.auth-shell__logo {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--klados-color) 12%, var(--surface));
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-1);
}
.auth-shell__logo img {
  width: 62px;
  height: 62px;
  object-fit: contain;
}
.auth-shell__name {
  margin-top: 12px;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.auth-shell__card {
  width: 100%;
  max-width: 420px;
}
</style>
