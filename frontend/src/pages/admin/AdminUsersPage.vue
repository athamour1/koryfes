<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Admin: Manage Users</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4" v-for="user in users" :key="user.id">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ user.username }}</div>
            <div class="text-subtitle2">{{ user.location }}</div>
          </q-card-section>

          <q-card-section>
            <div class="text-caption">Badges:</div>
            <div class="row q-gutter-sm">
              <div v-for="badge in user.badges" :key="badge.id" class="text-center">
                 <q-avatar size="30px" v-if="badge.image">
                    <img :src="`http://localhost:3000${badge.image}`" style="object-fit: cover" />
                 </q-avatar>
                 <q-badge v-else color="primary">{{ badge.name }}</q-badge>
                 <q-tooltip>{{ badge.name }}</q-tooltip>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Assign Badge" color="primary" @click="openAssignDialog(user)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="assignDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Assign Badge to {{ selectedUser?.username }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="selectedBadge"
            :options="badges"
            option-label="name"
            option-value="id"
            label="Select Badge"
            filled
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Assign" @click="assignBadge" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../stores/user';
import { useBadgeStore } from '../../stores/badge';
import { useQuasar } from 'quasar';

const userStore = useUserStore();
const badgeStore = useBadgeStore();
const $q = useQuasar();

const users = ref([]);
const badges = ref([]);
const assignDialog = ref(false);
const selectedUser = ref(null);
const selectedBadge = ref(null);

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  users.value = await userStore.fetchUsers();
  badges.value = await badgeStore.fetchBadges();
};

const openAssignDialog = (user) => {
  selectedUser.value = user;
  selectedBadge.value = null;
  assignDialog.value = true;
};

const assignBadge = async () => {
  if (selectedUser.value && selectedBadge.value) {
    const success = await userStore.assignBadge(selectedUser.value.id, selectedBadge.value.id);
    if (success) {
      $q.notify({
        color: 'positive',
        message: 'Badge assigned successfully',
        icon: 'check'
      });
      await loadData();
    } else {
      $q.notify({
        color: 'negative',
        message: 'Failed to assign badge',
        icon: 'report_problem'
      });
    }
  }
};
</script>
