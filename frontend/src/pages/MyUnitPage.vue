<template>
  <!-- «Η Ενωμοτία μου»: η κοινή σελίδα ενωμοτίας για την ενωμοτία του χρήστη -->
  <q-page class="tf-page">
    <PageHeader icon="groups" :title="$t('myUnit.title')" />
    <!-- μέχρι να φορτώσει ο χρήστης (και να γίνει η ανακατεύθυνση) -->
    <q-card v-if="!authStore.user || authStore.user.unit" flat bordered>
      <q-card-section class="row items-center no-wrap q-gutter-md">
        <q-skeleton type="rect" width="88px" height="88px" />
        <div class="col">
          <q-skeleton type="text" width="45%" height="36px" />
          <q-skeleton type="QChip" width="110px" height="24px" />
        </div>
      </q-card-section>
    </q-card>
    <div v-else class="row justify-center q-pa-xl">
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
