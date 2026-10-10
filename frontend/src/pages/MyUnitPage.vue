<template>
  <!-- «Η Ενωμοτία μου»: η κοινή σελίδα ενωμοτίας για την ενωμοτία του χρήστη -->
  <q-page class="tf-page">
    <PageHeader icon="groups" :title="$t('myUnit.title')" />
    <div class="row justify-center q-pa-xl">
      <div class="text-h6 text-grey">{{ $t('myUnit.notFound') }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/PageHeader.vue';

const router = useRouter();
const authStore = useAuthStore();

watchEffect(() => {
  const unitId = authStore.user?.unit?.id;
  if (unitId) router.replace(`/units/${unitId}`);
});
</script>
