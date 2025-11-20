<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Admin: Manage Users</div>

    <!-- Create New User Button -->
    <q-btn color="primary" icon="add" label="Create New User" @click="openCreateDialog" class="q-mb-md" />

    <!-- Users Table -->
    <q-table
      title="Users"
      :rows="filteredUsers"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
      :filter="filter"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="add" label="Create New User" class="q-ml-md" @click="openCreateDialog" />
      </template>

      <template v-slot:body-cell-profileImage="props">
        <q-td :props="props">
          <q-avatar size="40px">
            <img :src="getAvatarUrl(props.row.username, props.row.profileImage)" style="object-fit: cover" />
          </q-avatar>
        </q-td>
      </template>
      
      <template v-slot:body-cell-role="props">
        <q-td :props="props">
           <q-chip :color="getRoleColor(props.row.role)" text-color="white" dense>
             {{ props.row.role }}
           </q-chip>
        </q-td>
      </template>
      
      <template v-slot:body-cell-location="props">
        <q-td :props="props">
           {{ props.row.location ? props.row.location.name : 'N/A' }}
        </q-td>
      </template>

      <template v-slot:body-cell-badges="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-avatar v-for="badge in props.row.badges" :key="badge.id" size="24px">
              <img v-if="badge.image" :src="`${config.apiUrl}${badge.image}`" style="object-fit: cover" />
              <q-icon v-else name="star" color="primary" />
              <q-tooltip>{{ badge.name }}</q-tooltip>
            </q-avatar>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense color="primary" icon="edit" @click="openEditDialog(props.row)" />
          <q-btn 
            flat 
            dense 
            color="negative" 
            icon="delete" 
            @click="confirmDeleteUser(props.row)" 
            :disable="props.row.id === authStore.user?.id"
          >
            <q-tooltip v-if="props.row.id === authStore.user?.id">Cannot delete yourself</q-tooltip>
          </q-btn>
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
            
            <!-- Role Selection (Super Admin only) -->
            <q-select
              filled
              v-model="newUser.role"
              :options="availableRoleOptions"
              label="Role"
              emit-value
              map-options
            />
            
            <!-- Location Selection -->
            <q-select
              v-if="authStore.isSuperAdmin"
              filled
              v-model="newUser.locationName"
              :options="locationOptions"
              label="Location"
              option-label="name"
              option-value="name"
              emit-value
              map-options
              new-value-mode="add-unique"
            />
            <q-input v-else filled :model-value="authStore.user?.location?.name || 'My Location'" label="Location" readonly hint="Locked to your location" />

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
          
          <!-- Location Edit (Super Admin only for now, or allow admin to move user?) -->
          <q-select
              v-if="authStore.isSuperAdmin"
              filled
              v-model="editingUserData.locationName"
              :options="locationOptions"
              label="Location"
              option-label="name"
              option-value="name"
              emit-value
              map-options
            />
          
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
          <q-select
            filled
            v-model="selectedBadgeIds"
            multiple
            :options="badgeOptions"
            option-label="name"
            option-value="id"
            label="Select Badges"
            use-chips
            stack-label
            emit-value
            map-options
            use-input
            input-debounce="0"
            @filter="filterBadges"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar size="30px">
                    <img v-if="scope.opt.image" :src="`${config.apiUrl}${scope.opt.image}`" style="object-fit: cover" />
                    <q-icon v-else name="star" color="primary" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <q-chip
                removable
                @remove="scope.removeAtIndex(scope.index)"
                :tabindex="scope.tabindex"
                color="primary"
                text-color="white"
              >
                <q-avatar>
                  <img v-if="scope.opt.image" :src="`${config.apiUrl}${scope.opt.image}`" style="object-fit: cover" />
                  <q-icon v-else name="star" color="white" />
                </q-avatar>
                {{ scope.opt.name }}
              </q-chip>
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
import { useAuthStore } from '../../stores/auth';
import { useQuasar } from 'quasar';
import { config } from '../../config';
import { api } from '../../api';
import { getAvatarUrl } from '../../utils/avatar';

const userStore = useUserStore();
const badgeStore = useBadgeStore();
const authStore = useAuthStore();
const $q = useQuasar();

const users = ref([]);
const badges = ref([]);
const locationOptions = ref([]); // For dropdown
const createDialog = ref(false);
const editDialog = ref(false);
const editingUserData = ref(null);
const originalUserData = ref(null);
const hoveredBadge = ref(null);
const uploadImageFile = ref(null);
const selectedBadgeIds = ref([]);

const newUser = ref({
  username: '',
  password: '',
  locationName: '',
  role: 'user'
});

const roleOptions = [
  { label: 'User (Guide)', value: 'user' },
  { label: 'Admin (Captain)', value: 'admin' },
  { label: 'Super Admin', value: 'super_admin' }
];

const availableRoleOptions = computed(() => {
  if (authStore.isSuperAdmin) {
    return roleOptions;
  }
  return roleOptions.filter(opt => opt.value === 'user');
});

const filteredUsers = computed(() => {
  if (authStore.isSuperAdmin) {
    return users.value;
  }
  // Captains should only see simple users in their location
  // The backend findAll already filters by location for captains (if we implemented it, or if we rely on frontend)
  // But we should also filter by role to hide other admins if they exist in the same location
  return users.value.filter(u => u.role === 'user');
});

const availableBadges = computed(() => badges.value);
const badgeOptions = ref([]);

const filterBadges = (val, update) => {
  if (val === '') {
    update(() => {
      badgeOptions.value = availableBadges.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    badgeOptions.value = availableBadges.value.filter(v => v.name.toLowerCase().indexOf(needle) > -1);
  });
};

const loadData = async () => {
  try {
    await userStore.fetchUsers();
    users.value = userStore.users;
    
    await badgeStore.fetchBadges();
    badges.value = badgeStore.badges;
    
    // Only fetch locations if super admin (captains don't have access to locations endpoint)
    if (authStore.isSuperAdmin) {
      const locResponse = await api.get('/locations');
      locationOptions.value = locResponse.data;
    } else {
      // For captains, they can only see their own location
      locationOptions.value = authStore.user?.location ? [authStore.user.location] : [];
    }
  } catch (error) {
    console.error('Failed to load data', error);
    $q.notify({ color: 'negative', message: 'Failed to load data', icon: 'report_problem' });
  }
};

onMounted(() => {
  loadData();
});

const openEditDialog = (user) => {
  editingUserData.value = JSON.parse(JSON.stringify(user)); // Deep copy
  // Flatten location for q-select
  editingUserData.value.locationName = user.location?.name;
  
  // Initialize selected badges
  selectedBadgeIds.value = user.badges ? user.badges.map(b => b.id) : [];
  
  originalUserData.value = JSON.parse(JSON.stringify(user));
  uploadImageFile.value = null;
  editDialog.value = true;
};

const cancelEdit = () => {
  editingUserData.value = null;
  originalUserData.value = null;
  uploadImageFile.value = null;
  selectedBadgeIds.value = [];
};

const confirmDeleteUser = (user) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/users/${user.id}`);
      $q.notify({ color: 'positive', message: 'User deleted successfully', icon: 'check' });
      await loadData();
    } catch (error) {
      console.error('Failed to delete user', error);
      $q.notify({ color: 'negative', message: 'Failed to delete user', icon: 'report_problem' });
    }
  });
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

  // Update basic info and badges
  const success = await userStore.updateUser(editingUserData.value.id, {
    username: editingUserData.value.username,
    locationName: editingUserData.value.locationName,
    badges: selectedBadgeIds.value // Send array of badge IDs
  });

  if (!success) {
    $q.notify({ color: 'negative', message: 'Failed to update user', icon: 'report_problem' });
    return;
  }

  $q.notify({ color: 'positive', message: 'User updated successfully', icon: 'check' });
  editDialog.value = false;
  await loadData();
};

const handleBadgeRemove = async (userId, badge) => {
  const success = await userStore.removeBadge(userId, badge.id);
  if (success) {
    await loadData();
  }
};

const getRoleColor = (role) => {
    switch(role) {
        case 'super_admin': return 'negative';
        case 'admin': return 'warning';
        default: return 'primary';
    }
};

const openCreateDialog = () => {
    createDialog.value = true;
};

const createUser = async () => {
  try {
    const success = await userStore.createUser({
      username: newUser.value.username,
      password: newUser.value.password,
      locationName: newUser.value.locationName,
      role: newUser.value.role
    });
    
    if (success) {
      $q.notify({ color: 'positive', message: 'User created successfully', icon: 'check' });
      createDialog.value = false;
      
      // Reset form
      newUser.value = {
        username: '',
        password: '',
        locationName: '',
        role: 'user'
      };
      
      await loadData();
    } else {
      $q.notify({ color: 'negative', message: 'Failed to create user', icon: 'report_problem' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Failed to create user', icon: 'report_problem' });
  }
};
</script>
