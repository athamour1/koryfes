<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Admin: Manage Badges</div>

    <q-card class="q-mb-md" style="max-width: 500px">
      <q-card-section>
        <div class="text-h6">Create New Badge</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="createBadge" class="q-gutter-md">
          <q-input filled v-model="name" label="Badge Name" :rules="[val => !!val || 'Name is required']" />
          <q-input filled v-model="description" label="Description" type="textarea" />
          <q-file filled v-model="imageFile" label="Badge Image" accept=".jpg, .png, .jpeg">
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>

          <div>
            <q-btn label="Create Badge" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <div class="text-h5 q-mb-sm">Existing Badges</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4" v-for="badge in badges" :key="badge.id">
        <q-card>
          <q-card-section>
            <div class="row items-center no-wrap">
              <q-avatar size="50px" class="q-mr-md" v-if="badge.image">
                <img :src="`http://localhost:3000${badge.image}`" style="object-fit: cover" />
              </q-avatar>
              <div>
                <div class="text-h6">{{ badge.name }}</div>
                <div class="text-caption">{{ badge.description }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBadgeStore } from '../../stores/badge';
import { useQuasar } from 'quasar';

const badgeStore = useBadgeStore();
const $q = useQuasar();

const badges = ref([]);
const name = ref('');
const description = ref('');
const imageFile = ref(null);

onMounted(async () => {
  await loadBadges();
});

const loadBadges = async () => {
  badges.value = await badgeStore.fetchBadges();
};

const createBadge = async () => {
  const success = await badgeStore.createBadge({
    name: name.value,
    description: description.value,
    imageFile: imageFile.value
  });

  if (success) {
    $q.notify({
      color: 'positive',
      message: 'Badge created successfully',
      icon: 'check'
    });
    name.value = '';
    description.value = '';
    imageFile.value = null;
    await loadBadges();
  } else {
    $q.notify({
      color: 'negative',
      message: 'Failed to create badge',
      icon: 'report_problem'
    });
  }
};
</script>
