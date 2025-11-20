<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="auth-card">
      <q-card-section>
        <div class="text-h6 text-center">Forgot Password</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="email"
            label="Username / Email"
            lazy-rules
            :rules="[val => val && val.length > 0 || 'Please type your username']"
          />

          <div v-if="message" class="text-positive text-center q-mt-md">
            {{ message }}
          </div>
          <div v-if="error" class="text-negative text-center q-mt-md">
            {{ error }}
          </div>

          <div class="row justify-between items-center q-mt-md">
            <q-btn label="Back to Login" to="/login" flat color="primary" />
            <q-btn label="Send Reset Link" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
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
    message.value = 'If an account exists, a reset link has been sent (check console for mock token).';
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
