<template>
  <q-page class="flex flex-center login-page" @mousemove="handleMouseMove">
    <div class="interactive-bg" :style="bgStyle"></div>
    
    <q-card style="width: 100%; max-width: 400px; margin: 16px; z-index: 1; backdrop-filter: blur(10px); background: rgba(30, 30, 40, 0.85); border: 1px solid rgba(255,255,255,0.1);">
      <!-- Toggle Tabs -->
      <q-tabs
        v-model="tab"
        dense
        class="text-grey-5"
        active-color="white"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="login" :label="$t('auth.login.tab')" />
        <q-tab name="register" :label="$t('auth.register.tab')" />
      </q-tabs>

      <q-separator color="grey-8" />

      <q-tab-panels v-model="tab" animated class="bg-transparent text-white">
        <!-- Login Panel -->
        <q-tab-panel name="login">
          <q-card-section class="text-center q-pb-none">
            <div class="text-h4 text-weight-bold">{{ $t('auth.login.title') }}</div>
            <div class="text-subtitle2 text-grey-4">{{ $t('auth.login.subtitle') }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleLogin">
              <q-input 
                v-model="loginForm.username" 
                :label="$t('auth.form.username')" 
                outlined 
                dense 
                dark
                class="q-mb-md"
                :rules="[val => !!val || $t('auth.form.rules.usernameRequired')]"
              />
              <q-input 
                v-model="loginForm.password" 
                :label="$t('auth.form.password')" 
                type="password" 
                outlined 
                dense 
                dark
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
            <div class="text-subtitle2 text-grey-4">{{ $t('auth.register.subtitle') }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleRegister">
              <q-input 
                v-model="registerForm.username" 
                :label="$t('auth.form.username')" 
                outlined 
                dense 
                dark
                class="q-mb-md"
                :rules="usernameRules"
              />
              <q-input 
                v-model="registerForm.password" 
                :label="$t('auth.form.password')" 
                type="password" 
                outlined 
                dense 
                dark
                class="q-mb-md"
                :rules="passwordRules"
              />
              <q-input 
                v-model="registerForm.location" 
                :label="$t('auth.form.location')" 
                outlined 
                dense 
                dark
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { config } from 'src/config';

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const tab = ref('login');
const loginForm = ref({ username: '', password: '' });
const registerForm = ref({ username: '', password: '', location: '' });
const mouseX = ref(50);
const mouseY = ref(50);

const bgStyle = computed(() => ({
  '--mouse-x': `${mouseX.value}%`,
  '--mouse-y': `${mouseY.value}%`
}));

const handleMouseMove = (event) => {
  const { clientX, clientY } = event;
  const { innerWidth, innerHeight } = window;
  mouseX.value = (clientX / innerWidth) * 100;
  mouseY.value = (clientY / innerHeight) * 100;
};

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

<style scoped>
.login-page {
  position: relative;
  overflow: hidden;
  background: #1a1a2e; /* Fallback */
}

.interactive-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(
      circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(138, 43, 226, 0.4) 0%,
      rgba(0, 0, 0, 0) 50%
    ),
    linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  z-index: 0;
  transition: background 0.1s ease;
}
</style>
