<template>
  <q-page class="flex flex-center">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="Username" />
        <q-input v-model="password" label="Password" type="password" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Login" color="primary" @click="login" />
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
const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const login = async () => {
  const success = await authStore.login(username.value, password.value);
  if (success) {
    router.push('/profile');
  } else {
    $q.notify({
      color: 'negative',
      message: 'Login failed',
      icon: 'report_problem'
    });
  }
};
</script>
