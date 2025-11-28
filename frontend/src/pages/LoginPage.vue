<template>
  <q-page class="flex flex-center login-page" @mousemove="handleMouseMove">
    <div class="interactive-bg" :style="bgStyle"></div>
    
    <q-card style="width: 100%; max-width: 400px; margin: 16px; z-index: 1; backdrop-filter: blur(10px); background: rgba(30, 30, 40, 0.85); border: 1px solid rgba(255,255,255,0.1);">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h4 text-weight-bold text-grey-4">{{ $t('auth.login.title') }}</div>
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
                data-cy="username-input"
              />
              <q-input 
                v-model="loginForm.password" 
                :label="$t('auth.form.password')" 
                :type="isPwd ? 'password' : 'text'" 
                outlined 
                dense 
                dark
                class="q-mb-md"
                :rules="[val => !!val || $t('auth.form.rules.passwordRequired')]"
                data-cy="password-input"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
              <div class="row items-center q-mb-md">
                <q-checkbox v-model="rememberMe" :label="$t('auth.login.rememberMe')" dark dense color="primary" class="text-grey-4" />
              </div>
              <q-btn 
                :label="$t('auth.login.button')" 
                type="submit" 
                color="primary" 
                class="full-width" 
                size="md"
                unelevated
                data-cy="login-btn"
              />
            </q-form>
          </q-card-section>
      <q-card-section v-if="stagingMessage" class="text-center q-pt-none text-warning">
        <div class="text-caption text-orange">{{ stagingMessage }}</div>
      </q-card-section>
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
const rememberMe = ref(false);
const isPwd = ref(true);
const stagingMessage = config.stagingMessage;
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



const handleLogin = async () => {
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
