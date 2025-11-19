<template>
  <q-page class="flex flex-center">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">Register</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="Username" />
        <q-input v-model="password" label="Password" type="password" />
        <q-input v-model="location" label="Location" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Register" color="primary" @click="register" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const username = ref('');
const password = ref('');
const location = ref('');
const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const register = async () => {
  const result = await authStore.register(username.value, password.value, location.value);
  if (result.success) {
    $q.notify({
      color: 'positive',
      message: 'Registration successful, please login',
      icon: 'check'
    });
    router.push('/login');
  } else {
    $q.notify({
      color: 'negative',
      message: result.message,
      icon: 'report_problem'
    });
  }
};
</script>
