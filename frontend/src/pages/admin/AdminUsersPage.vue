<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Admin: Manage Users</div>

    <!-- Create New User Button -->
    <q-btn color="primary" icon="add" label="Create New User" @click="createDialog = true" class="q-mb-md" />

    <!-- Users Table -->
    <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-profileImage="props">
        <q-td :props="props">
          <q-avatar size="40px">
            <img :src="getAvatarUrl(props.row.username, props.row.profileImage)" style="object-fit: cover" />
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-badges="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <div 
              v-for="badge in props.row.badges" 
              :key="badge.id" 
              class="relative-position"
              @click="handleBadgeRemove(props.row.id, badge)"
              @mouseenter="hoveredBadge = `${props.row.id}-${badge.id}`"
              @mouseleave="hoveredBadge = null"
              style="cursor: pointer"
            >
              <q-avatar size="40px" style="border-radius: 8px">
                <img v-if="badge.image" :src="`${config.apiUrl}${badge.image}`" style="object-fit: cover; border-radius: 8px" />
                <q-icon v-else name="star" color="primary" />
                <q-tooltip>{{ badge.name }}</q-tooltip>
              </q-avatar>
              <div 
                class="absolute-center flex items-center justify-center"
                style="opacity: 0; transition: opacity 0.2s; background: rgba(255,255,255,0.9); border-radius: 8px; width: 100%; height: 100%"
                :style="{ opacity: hoveredBadge === `${props.row.id}-${badge.id}` ? 1 : 0 }"
              >
                <q-icon 
                  name="close" 
                  size="md" 
                  color="black"
                />
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense color="primary" icon="edit" @click="openEditDialog(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Create User Dialog -->
    <q-dialog v-model="createDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Create New User</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="createUser" class="q-gutter-md">
            <q-input filled v-model="newUser.username" label="Username" :rules="[val => !!val || 'Required']" />
            <q-input filled v-model="newUser.password" label="Password" type="password" :rules="[val => !!val || 'Required']" />
            <q-input filled v-model="newUser.location" label="Location" />
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" flat v-close-popup />
              <q-btn label="Create" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Edit User Dialog -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Edit User: {{ editingUserData?.username }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input filled v-model="editingUserData.username" label="Username" />
          <q-input filled v-model="editingUserData.location" label="Location" />
          
          <div class="text-subtitle2 q-mt-md">Profile Image</div>
          <div class="row items-center q-gutter-md">
            <q-avatar size="60px">
              <img :src="getAvatarUrl(editingUserData.username, editingUserData.profileImage)" style="object-fit: cover" />
            </q-avatar>
            <q-file filled v-model="uploadImageFile" label="Change Image" accept=".jpg, .png, .jpeg">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
          </div>

          <div class="text-subtitle2 q-mt-md">Badges</div>
          <div class="row q-gutter-sm q-mb-md">
            <div 
              v-for="badge in editingUserData.badges" 
              :key="badge.id" 
              class="relative-position"
              @click="removeBadgeFromEdit(badge)"
              @mouseenter="hoveredBadge = `edit-${badge.id}`"
              @mouseleave="hoveredBadge = null"
              style="cursor: pointer"
            >
              <q-avatar size="50px" style="border-radius: 8px">
                <img v-if="badge.image" :src="`${config.apiUrl}${badge.image}`" style="object-fit: cover; border-radius: 8px" />
                <q-icon v-else name="star" color="primary" />
                <q-tooltip>{{ badge.name }}</q-tooltip>
              </q-avatar>
              <div 
                class="absolute-center flex items-center justify-center"
                style="opacity: 0; transition: opacity 0.2s; background: rgba(255,255,255,0.9); border-radius: 8px; width: 100%; height: 100%"
                :style="{ opacity: hoveredBadge === `edit-${badge.id}` ? 1 : 0 }"
              >
                <q-icon name="close" size="md" color="black" />
              </div>
            </div>
          </div>
          
          <q-select
            v-model="selectedBadgeToAdd"
            :options="availableBadges"
            option-label="name"
            option-value="id"
            label="Add Badge"
            filled
            clearable
          >
            <template v-slot:append>
              <q-btn flat dense icon="add" color="primary" @click="addBadgeToEdit" :disable="!selectedBadgeToAdd" />
            </template>
          </q-select>
        </q-card-section>
        
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" flat v-close-popup @click="cancelEdit" />
          <q-btn label="Save Changes" color="primary" @click="saveUserEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '../../stores/user';
import { useBadgeStore } from '../../stores/badge';
import { useQuasar } from 'quasar';
import { config } from '../../config';
import { api } from '../../api';
import { getAvatarUrl } from '../../utils/avatar';

const userStore = useUserStore();
const badgeStore = useBadgeStore();
const $q = useQuasar();

const users = ref([]);
const badges = ref([]);
const createDialog = ref(false);
const editDialog = ref(false);
const editingUserData = ref(null);
const originalUserData = ref(null);
const hoveredBadge = ref(null);
const uploadImageFile = ref(null);
const selectedBadgeToAdd = ref(null);

const newUser = ref({
  username: '',
  password: '',
  location: ''
});

const columns = [
  { name: 'profileImage', label: 'Avatar', field: 'profileImage', align: 'center' },
  { name: 'username', label: 'Username', field: 'username', align: 'left', sortable: true },
  { name: 'location', label: 'Location', field: 'location', align: 'left', sortable: true },
  { name: 'badges', label: 'Badges', field: 'badges', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center' }
];

const availableBadges = computed(() => {
  if (!editingUserData.value) return badges.value;
  const userBadgeIds = editingUserData.value.badges.map(b => b.id);
  return badges.value.filter(b => !userBadgeIds.includes(b.id));
});

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  users.value = await userStore.fetchUsers();
  badges.value = await badgeStore.fetchBadges();
};

const createUser = async () => {
  try {
    await api.post('/auth/register', newUser.value);
    $q.notify({ color: 'positive', message: 'User created successfully', icon: 'check' });
    newUser.value = { username: '', password: '', location: '' };
    createDialog.value = false;
    await loadData();
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Failed to create user', icon: 'report_problem' });
  }
};

const openEditDialog = (user) => {
  editingUserData.value = JSON.parse(JSON.stringify(user)); // Deep copy
  originalUserData.value = JSON.parse(JSON.stringify(user));
  uploadImageFile.value = null;
  selectedBadgeToAdd.value = null;
  editDialog.value = true;
};

const cancelEdit = () => {
  editingUserData.value = null;
  originalUserData.value = null;
  uploadImageFile.value = null;
  selectedBadgeToAdd.value = null;
};

const saveUserEdit = async () => {
  // Upload image if changed
  if (uploadImageFile.value) {
    const imageSuccess = await userStore.uploadUserImage(editingUserData.value.id, uploadImageFile.value);
    if (!imageSuccess) {
      $q.notify({ color: 'negative', message: 'Failed to upload image', icon: 'report_problem' });
      return;
    }
  }

  // Update basic info
  const success = await userStore.updateUser(editingUserData.value.id, {
    username: editingUserData.value.username,
    location: editingUserData.value.location
  });

  if (!success) {
    $q.notify({ color: 'negative', message: 'Failed to update user', icon: 'report_problem' });
    return;
  }

  $q.notify({ color: 'positive', message: 'User updated successfully', icon: 'check' });
  editDialog.value = false;
  await loadData();
};

const addBadgeToEdit = async () => {
  if (selectedBadgeToAdd.value && editingUserData.value) {
    const success = await userStore.assignBadge(editingUserData.value.id, selectedBadgeToAdd.value.id);
    if (success) {
      editingUserData.value.badges.push(selectedBadgeToAdd.value);
      selectedBadgeToAdd.value = null;
    }
  }
};

const removeBadgeFromEdit = async (badge) => {
  if (editingUserData.value) {
    const success = await userStore.removeBadge(editingUserData.value.id, badge.id);
    if (success) {
      editingUserData.value.badges = editingUserData.value.badges.filter(b => b.id !== badge.id);
    }
  }
};

const handleBadgeRemove = async (userId, badge) => {
  const success = await userStore.removeBadge(userId, badge.id);
  if (success) {
    await loadData();
  }
};
</script>
