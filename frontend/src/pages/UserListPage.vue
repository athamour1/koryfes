<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Scouts Directory</div>
    
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-input v-model="filterName" label="Filter by Name" outlined dense @update:model-value="fetchUsers" />
      </div>
      <div class="col-12 col-md-4">
        <q-input v-model="filterLocation" label="Filter by Location" outlined dense @update:model-value="fetchUsers" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="user in userStore.users" :key="user.id" class="col-12 col-sm-6 col-md-4">
        <q-card>
          <q-card-section class="row items-center no-wrap">
            <q-avatar size="50px" class="q-mr-md">
               <img :src="user.profileImage ? `http://localhost:3000${user.profileImage}` : 'https://cdn.quasar.dev/img/boy-avatar.png'" style="object-fit: cover" />
            </q-avatar>
            <div>
                <div class="text-h6">{{ user.username }}</div>
                <div class="text-subtitle2">{{ user.location }}</div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Badges:</div>
            <div v-if="user.badges && user.badges.length > 0" class="row q-gutter-sm">
              <div v-for="badge in user.badges" :key="badge.id" class="text-center">
                 <q-avatar size="40px" v-if="badge.image">
                    <img :src="`http://localhost:3000${badge.image}`" style="object-fit: cover" />
                 </q-avatar>
                 <q-badge v-else color="primary">{{ badge.name }}</q-badge>
                 <div class="text-caption" style="font-size: 0.7rem">{{ badge.name }}</div>
                 <q-tooltip>{{ badge.description }}</q-tooltip>
              </div>
            </div>
            <div v-else class="text-grey">No badges</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const filterName = ref('');
const filterLocation = ref('');

const fetchUsers = () => {
  userStore.fetchUsers(filterLocation.value, filterName.value);
};

onMounted(async () => {
  fetchUsers();
});
</script>

