<template>
  <q-page class="flex flex-center gradient-purple">
    <q-card class="auth-card" flat bordered>
      <q-card-section>
        <div class="text-h6 text-center">Reset Password</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="password"
            label="New Password"
            type="password"
            lazy-rules
            :rules="[
              val => val && val.length >= 8 || 'Password must be at least 8 characters',
              val => /[A-Z]/.test(val) || 'Must contain uppercase letter',
              val => /[a-z]/.test(val) || 'Must contain lowercase letter',
              val => /[0-9]/.test(val) || 'Must contain number'
            ]"
          />

          <div v-if="success" class="text-positive text-center q-mt-md">
            Password reset successfully! Redirecting to login...
          </div>
          <div v-if="error" class="text-negative text-center q-mt-md">
            {{ error }}
          </div>

          <div class="row justify-end q-mt-md">
            <q-btn label="Reset Password" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const password = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref('');
const token = ref('');

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    error.value = 'Invalid or missing reset token.';
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
    error.value = result.message || 'Failed to reset password';
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
