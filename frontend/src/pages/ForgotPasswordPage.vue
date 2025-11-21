<template>
  <q-page class="flex flex-center gradient-purple">
    <q-card class="auth-card" flat bordered>
      <q-card-section>
        <div class="text-h6 text-center">{{ $t('auth.forgotPassword.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="email"
            :label="$t('auth.forgotPassword.label')"
            lazy-rules
            :rules="[val => val && val.length > 0 || $t('auth.forgotPassword.rule')]"
          />

          <div v-if="message" class="text-positive text-center q-mt-md">
            {{ message }}
          </div>
          <div v-if="error" class="text-negative text-center q-mt-md">
            {{ error }}
          </div>

          <div class="row justify-between items-center q-mt-md">
            <q-btn :label="$t('auth.forgotPassword.backToLogin')" to="/login" flat color="primary" />
            <q-btn :label="$t('auth.forgotPassword.submit')" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t } = useI18n();
const email = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');

const onSubmit = async () => {
  loading.value = true;
  message.value = '';
  error.value = '';
  
  const result = await authStore.forgotPassword(email.value);
  
  if (result.success) {
    message.value = t('auth.forgotPassword.success');
  } else {
    error.value = result.message;
  }
  
  loading.value = false;
};
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>
