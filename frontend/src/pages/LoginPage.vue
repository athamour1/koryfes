<template>
  <q-page class="flex flex-center gradient-purple">
    <q-card style="width: 100%; max-width: 400px; margin: 16px;">
      <!-- Toggle Tabs -->
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="login" :label="$t('auth.login.tab')" />
        <q-tab name="register" :label="$t('auth.register.tab')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Login Panel -->
        <q-tab-panel name="login">
          <q-card-section class="text-center q-pb-none">
            <div class="text-h4 text-weight-bold">{{ $t('auth.login.title') }}</div>
            <div class="text-subtitle2 text-grey-7">{{ $t('auth.login.subtitle') }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleLogin">
              <q-input 
                v-model="loginForm.username" 
                :label="$t('auth.form.username')" 
                outlined 
                dense 
                class="q-mb-md"
                :rules="[val => !!val || $t('auth.form.rules.usernameRequired')]"
              />
              <q-input 
                v-model="loginForm.password" 
                :label="$t('auth.form.password')" 
                type="password" 
                outlined 
                dense 
                class="q-mb-md"
                :rules="[val => !!val || $t('auth.form.rules.passwordRequired')]"
              />
              <q-btn 
                :label="$t('auth.login.button')" 
                type="submit" 
                color="primary" 
                class="full-width" 
                size="md"
                unelevated
              />
            </q-form>
          </q-card-section>
        </q-tab-panel>

        <!-- Register Panel -->
        <q-tab-panel name="register">
          <q-card-section class="text-center q-pb-none">
            <div class="text-h4 text-weight-bold">{{ $t('auth.register.title') }}</div>
            <div class="text-subtitle2 text-grey-7">{{ $t('auth.register.subtitle') }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleRegister">
              <q-input 
                v-model="registerForm.username" 
                :label="$t('auth.form.username')" 
                outlined 
                dense 
                class="q-mb-md"
                :rules="usernameRules"
              />
              <q-input 
                v-model="registerForm.password" 
                :label="$t('auth.form.password')" 
                type="password" 
                outlined 
                dense 
                class="q-mb-md"
                :rules="passwordRules"
              />
              <q-input 
                v-model="registerForm.location" 
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
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { config } from '../config';

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const tab = ref('login');
const loginForm = ref({ username: '', password: '' });
const registerForm = ref({ username: '', password: '', location: '' });

// Validation rules for register
const usernameRules = computed(() => {
  if (config.isProd) {
    return [
      val => !!val || t('auth.form.rules.usernameRequired'),
      val => /.+@.+\..+/.test(val) || t('auth.form.rules.validEmail')
    ];
  }
  return [val => !!val || t('auth.form.rules.usernameRequired')];
});

const passwordRules = computed(() => {
  if (config.isProd) {
    return [
      val => !!val || t('auth.form.rules.passwordRequired'),
      val => val.length >= 8 || t('auth.form.rules.passwordLength'),
      val => /[A-Z]/.test(val) || t('auth.form.rules.passwordUpper'),
      val => /[a-z]/.test(val) || t('auth.form.rules.passwordLower'),
      val => /[0-9]/.test(val) || t('auth.form.rules.passwordNumber')
    ];
  }
  return [val => !!val || t('auth.form.rules.passwordRequired')];
});

const handleLogin = async () => {
  try {
    const success = await authStore.login(loginForm.value.username, loginForm.value.password);
    
    if (!success) {
      $q.notify({
        color: 'negative',
        message: t('auth.login.invalid'),
        icon: 'report_problem',
        position: 'top'
      });
      return;
    }
    
    // Redirect based on user role
    if (authStore.isAdmin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/my-badges');
    }
  } catch (error) {
    console.error('Login failed', error);
    const errorMessage = error.response?.data?.message || t('auth.login.invalid');
    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'report_problem',
      position: 'top'
    });
  }
};

const handleRegister = async () => {
  try {
    await authStore.register(registerForm.value);
    $q.notify({
      color: 'positive',
      message: t('auth.register.success'),
      icon: 'check'
    });
    tab.value = 'login';
    loginForm.value.username = registerForm.value.username;
    registerForm.value = { username: '', password: '', location: '' };
  } catch (error) {
    console.error('Registration failed', error);
    $q.notify({
      color: 'negative',
      message: t('auth.register.failed'),
      icon: 'report_problem'
    });
  }
};
</script>
