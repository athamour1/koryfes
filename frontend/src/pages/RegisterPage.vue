<template>
  <q-page class="flex flex-center gradient-purple">
    <q-card style="width: 100%; max-width: 400px; margin: 16px;">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h4 text-weight-bold">Create Account</div>
        <div class="text-subtitle2 text-grey-7">Join Scout Badges today</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleRegister">
          <q-input 
            v-model="username" 
            label="Username" 
            outlined 
            dense 
            class="q-mb-md"
            :rules="usernameRules"
          />
          <q-input 
            v-model="password" 
            label="Password" 
            type="password" 
            outlined 
            dense 
            class="q-mb-md"
            :rules="passwordRules"
          />
          <q-input 
            v-model="location" 
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

      <q-card-section class="text-center q-pt-none">
        <div class="text-caption text-grey-7">
          Already have an account? 
          <router-link to="/login" class="text-primary">Login here</router-link>
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

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const username = ref('');
const password = ref('');
const location = ref('');

const isProd = import.meta.env.VITE_ENV === 'production';

const usernameRules = isProd ? [
  val => !!val || 'Username is required',
  val => /.+@.+\..+/.test(val) || 'Must be a valid email address'
] : [val => !!val || 'Username is required'];

const passwordRules = isProd ? [
  val => !!val || 'Password is required',
  val => val.length >= 8 || 'Password must be at least 8 characters',
  val => /[A-Z]/.test(val) || 'Password must contain an uppercase letter',
  val => /[a-z]/.test(val) || 'Password must contain a lowercase letter',
  val => /[0-9]/.test(val) || 'Password must contain a number'
] : [val => !!val || 'Password is required'];

const handleRegister = async () => {
  const success = await authStore.register({
    username: username.value,
    password: password.value,
    location: location.value,
  });

  if (success) {
    $q.notify({ color: 'positive', message: 'Registration successful! Please login.' });
    router.push('/login');
  } else {
    $q.notify({ color: 'negative', message: 'Registration failed' });
  }
};
</script>
