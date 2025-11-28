<template>
  <q-page class="flex flex-center gradient-purple">
    <q-card class="auth-card" flat bordered>
      <q-card-section>
        <div class="text-h6 text-center">{{ $t('auth.resetPassword.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="password"
            :label="$t('auth.resetPassword.label')"
            type="password"
            lazy-rules
            :rules="[
              val => val && val.length >= 8 || $t('auth.form.rules.passwordLength'),
              val => /[A-Z]/.test(val) || $t('auth.form.rules.passwordUpper'),
              val => /[a-z]/.test(val) || $t('auth.form.rules.passwordLower'),
              val => /[0-9]/.test(val) || $t('auth.form.rules.passwordNumber')
            ]"
          />

          <div v-if="success" class="text-positive text-center q-mt-md">
            {{ $t('auth.resetPassword.success') }}
          </div>
          <div v-if="error" class="text-negative text-center q-mt-md">
            {{ error }}
          </div>

          <div class="row justify-end q-mt-md">
            <q-btn :label="$t('auth.resetPassword.button')" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const password = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref('');
const token = ref('');

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    error.value = t('auth.resetPassword.invalidToken');
  }
});

const onSubmit = async () => {
  if (!token.value) return;
  
  loading.value = true;
  error.value = '';
  
  const result = await authStore.resetPassword(token.value, password.value);
  
  if (result.success) {
    success.value = true;
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } else {
    error.value = result.message || t('auth.resetPassword.failed');
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
