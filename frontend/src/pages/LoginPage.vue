<template>
  <AuthShell>
    <q-form @submit="handleLogin" class="q-gutter-y-sm">
      <q-input
        v-model="loginForm.username"
        :label="$t('auth.form.username')"
        outlined
        autocomplete="username"
        :rules="[val => !!val || $t('auth.form.rules.usernameRequired')]"
        data-cy="username-input"
      >
        <template #prepend><q-icon name="person" /></template>
      </q-input>
      <q-input
        v-model="loginForm.password"
        :label="$t('auth.form.password')"
        :type="isPwd ? 'password' : 'text'"
        outlined
        autocomplete="current-password"
        :rules="[val => !!val || $t('auth.form.rules.passwordRequired')]"
        data-cy="password-input"
      >
        <template #prepend><q-icon name="lock" /></template>
        <template #append>
          <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
        </template>
      </q-input>
      <q-checkbox v-model="rememberMe" :label="$t('auth.login.rememberMe')" dense class="round-checkbox" />
      <q-btn
        :label="$t('auth.login.button')"
        type="submit"
        color="primary"
        class="full-width q-mt-md"
        unelevated
        size="md"
        :loading="loading"
        data-cy="login-btn"
      />
    </q-form>
    <template v-if="stagingMessage" #footer>
      <q-separator />
      <q-card-section class="text-center text-caption text-warning">{{ stagingMessage }}</q-card-section>
    </template>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue';
import AuthShell from '@/components/AuthShell.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { config } from '@/config';

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const tab = ref('login');
const loginForm = ref({ username: '', password: '' });
const rememberMe = ref(false);
const isPwd = ref(true);
const stagingMessage = config.stagingMessage;
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    const success = await authStore.login(loginForm.value.username, loginForm.value.password, rememberMe.value);
    
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
      router.push('/my-progress');
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
  } finally {
    loading.value = false;
  }
};


</script>

<style scoped>
.round-checkbox :deep(.q-checkbox__bg) {
  border-radius: 50%;
}
</style>
