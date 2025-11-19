<template>
  <q-page class="flex flex-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
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
        <q-tab name="login" label="Login" />
        <q-tab name="register" label="Register" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Login Panel -->
        <q-tab-panel name="login">
          <q-card-section class="text-center q-pb-none">
            <div class="text-h4 text-weight-bold">Welcome Back</div>
            <div class="text-subtitle2 text-grey-7">Sign in to continue</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleLogin">
              <q-input 
                v-model="loginForm.username" 
                label="Username" 
                outlined 
                dense 
                class="q-mb-md"
                :rules="[val => !!val || 'Username is required']"
              />
              <q-input 
                v-model="loginForm.password" 
                label="Password" 
                type="password" 
                outlined 
                dense 
                class="q-mb-md"
                :rules="[val => !!val || 'Password is required']"
              />
              <q-btn 
                label="Login" 
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
            <div class="text-h4 text-weight-bold">Create Account</div>
            <div class="text-subtitle2 text-grey-7">Join Scout Badges today</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleRegister">
              <q-input 
                v-model="registerForm.username" 
                label="Username" 
                outlined 
                dense 
                class="q-mb-md"
                :rules="usernameRules"
              />
              <q-input 
                v-model="registerForm.password" 
                label="Password" 
                type="password" 
                outlined 
                dense 
                class="q-mb-md"
                :rules="passwordRules"
              />
              <q-input 
                v-model="registerForm.location" 
                label="Location (Optional)" 
                outlined 
                dense 
                class="q-mb-md"
              />
              <q-btn 
                label="Register" 
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
import { config } from '../config';

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const tab = ref('login');
const loginForm = ref({ username: '', password: '' });
const registerForm = ref({ username: '', password: '', location: '' });

// Validation rules for register
const usernameRules = computed(() => {
  if (config.isProd) {
    return [
      val => !!val || 'Username is required',
      val => /.+@.+\..+/.test(val) || 'Must be a valid email'
    ];
  }
  return [val => !!val || 'Username is required'];
});

const passwordRules = computed(() => {
  if (config.isProd) {
    return [
      val => !!val || 'Password is required',
      val => val.length >= 8 || 'Password must be at least 8 characters',
      val => /[A-Z]/.test(val) || 'Password must contain an uppercase letter',
      val => /[a-z]/.test(val) || 'Password must contain a lowercase letter',
      val => /[0-9]/.test(val) || 'Password must contain a number'
    ];
  }
  return [val => !!val || 'Password is required'];
});

const handleLogin = async () => {
  try {
    await authStore.login(loginForm.value.username, loginForm.value.password);
    
    // Redirect based on user role
    if (authStore.isAdmin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/my-badges');
    }
  } catch (error) {
    console.error('Login failed', error);
    $q.notify({
      color: 'negative',
      message: 'Login failed',
      icon: 'report_problem'
    });
  }
};

const handleRegister = async () => {
  try {
    await authStore.register(registerForm.value);
    $q.notify({
      color: 'positive',
      message: 'Registration successful! Please login.',
      icon: 'check'
    });
    tab.value = 'login';
    loginForm.value.username = registerForm.value.username;
    registerForm.value = { username: '', password: '', location: '' };
  } catch (error) {
    console.error('Registration failed', error);
    $q.notify({
      color: 'negative',
      message: 'Registration failed',
      icon: 'report_problem'
    });
  }
};
</script>
