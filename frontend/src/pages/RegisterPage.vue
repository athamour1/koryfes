<template>
  <q-page class="flex flex-center gradient-purple">
    <q-card style="width: 100%; max-width: 400px; margin: 16px;">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h4 text-weight-bold">{{ $t('auth.register.title') }}</div>
        <div class="text-subtitle2 text-grey-7">{{ $t('auth.register.subtitle') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleRegister">
          <q-input 
            v-model="username" 
            :label="$t('auth.form.username')" 
            outlined 
            dense 
            class="q-mb-md"
            :rules="usernameRules"
          />
          <q-input 
            v-model="password" 
            :label="$t('auth.form.password')" 
            type="password" 
            outlined 
            dense 
            class="q-mb-md"
            :rules="passwordRules"
          />
          <q-input 
            v-model="location" 
            :label="$t('auth.form.location')" 
            outlined 
            dense 
            class="q-mb-md"
          />
          <q-btn 
            :label="$t('auth.register.button')" 
            type="submit" 
            color="primary" 
            class="full-width" 
            size="md"
            unelevated
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <div class="text-caption text-grey-7">
          {{ $t('auth.register.alreadyHaveAccount') }} 
          <router-link to="/login" class="text-primary">{{ $t('auth.register.loginLink') }}</router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const username = ref('');
const password = ref('');
const location = ref('');

const isProd = import.meta.env.VITE_ENV === 'production';

const usernameRules = isProd ? [
  val => !!val || t('auth.form.rules.usernameRequired'),
  val => /.+@.+\..+/.test(val) || t('auth.form.rules.validEmail')
] : [val => !!val || t('auth.form.rules.usernameRequired')];

const passwordRules = isProd ? [
  val => !!val || t('auth.form.rules.passwordRequired'),
  val => val.length >= 8 || t('auth.form.rules.passwordLength'),
  val => /[A-Z]/.test(val) || t('auth.form.rules.passwordUpper'),
  val => /[a-z]/.test(val) || t('auth.form.rules.passwordLower'),
  val => /[0-9]/.test(val) || t('auth.form.rules.passwordNumber')
] : [val => !!val || t('auth.form.rules.passwordRequired')];

const handleRegister = async () => {
  const success = await authStore.register({
    username: username.value,
    password: password.value,
    location: location.value,
  });

  if (success) {
    $q.notify({ color: 'positive', message: t('auth.register.success') });
    router.push('/login');
  } else {
    $q.notify({ color: 'negative', message: t('auth.register.failed') });
  }
};
</script>
