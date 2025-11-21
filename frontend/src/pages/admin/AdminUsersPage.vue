<template>
  <q-page class="users-page">
    <!-- Hero Header -->
    <div class="q-pa-md">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1400px; margin: 0 auto;">
        <div class="text-center" style="max-width: 800px; margin: 0 auto;">
          <q-icon name="people" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold q-mb-sm">User Management</div>
          <div class="text-body1" style="opacity: 0.9;">Manage scout users, roles, and permissions</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto;">

      <q-card flat bordered>
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
      <template v-slot:top>
        <div class="full-width">
          <div class="row q-col-gutter-sm items-center justify-between">
            <!-- Left side: Filters -->
            <div class="col-12 col-md-auto row q-col-gutter-sm items-center">
              <div class="text-h6 q-mr-md gt-sm">Users</div>
              
              <!-- Search -->
              <div class="col-12 col-sm-auto">
                <q-input outlined dense debounce="300" v-model="filter" placeholder="Search by name" class="search-input">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <!-- Super Admin only filters -->
              <div class="col-6 col-sm-auto" v-if="authStore.isSuperAdmin">
                <q-select
                  v-model="roleFilter"
                  :options="roleFilterOptions"
                  label="Role"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                />
              </div>
              <div class="col-6 col-sm-auto" v-if="authStore.isSuperAdmin">
                <q-select
                  v-model="locationFilter"
                  :options="locationOptions"
                  option-label="name"
                  option-value="name"
                  emit-value
                  map-options
                  label="Location"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                />
              </div>

              <!-- Unit filter for all admins -->
              <div class="col-6 col-sm-auto">
                <q-select
                  v-model="unitFilter"
                  :options="unitOptions"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  label="Unit"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                />
              </div>

              <!-- Unit role filter for all -->
              <div class="col-6 col-sm-auto">
                <q-select
                  v-model="unitRoleFilter"
                  :options="unitRoleFilterOptions"
                  label="Unit Role"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                />
              </div>
            </div>

            <!-- Right side: Actions -->
            <div class="col-12 col-md-auto text-right q-mt-sm q-mt-md-none">
              <q-btn color="primary" icon="add" label="Create User" @click="openCreateDialog" class="full-width-mobile" />
            </div>
          </div>
        </div>
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
           <q-chip :color="getRoleColor(props.row.role)" text-color="white" dense class="text-weight-bold">
             {{ props.row.role }}
           </q-chip>
        </q-td>
      </template>
      
      <template v-slot:body-cell-location="props">
        <q-td :props="props">
           <q-chip v-if="props.row.location" color="teal" text-color="white" dense outline icon="place">
             {{ props.row.location.name }}
           </q-chip>
           <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-unit="props">
        <q-td :props="props">
           <q-chip v-if="props.row.unit" color="blue-grey" text-color="white" dense outline icon="groups">
             {{ props.row.unit.name }}
           </q-chip>
           <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-unitRole="props">
        <q-td :props="props">
          <q-chip v-if="props.row.unit && props.row.unitRole" :color="getUnitRoleColor(props.row.unitRole)" text-color="white" dense size="sm" class="text-weight-bold">
            {{ formatUnitRole(props.row.unitRole) }}
          </q-chip>
          <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row justify-end no-wrap">
            <q-btn flat dense round color="primary" icon="edit" @click="openEditDialog(props.row)">
              <q-tooltip>Edit User</q-tooltip>
            </q-btn>
            <q-btn 
              flat 
              dense 
              round
              color="negative" 
              icon="delete" 
              @click="confirmDeleteUser(props.row)" 
              :disable="props.row.id === authStore.user?.id"
            >
              <q-tooltip v-if="props.row.id === authStore.user?.id">Cannot delete yourself</q-tooltip>
              <q-tooltip v-else>Delete User</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
          <q-icon size="2em" :name="filter ? 'search_off' : 'people_outline'" />
          <span>
            {{ filter ? 'No users match your search' : 'No users created yet' }}
          </span>
        </div>
      </template>
        </q-table>
      </q-card>
    </div>

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
              @update:model-value="val => { if(val !== 'user') { newUser.unitId = null; newUser.unitRole = null; } }"
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

            <!-- Unit Selection -->
            <q-select
              v-if="newUser.role === 'user'"
              filled
              v-model="newUser.unitId"
              :options="createUnitOptions"
              label="Unit"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              clearable
              @update:model-value="val => { if(val && !newUser.unitRole) newUser.unitRole = 'member' }"
            />

            <!-- Unit Role Selection (only when unit selected) -->
            <q-select
              v-if="newUser.unitId"
              filled
              v-model="newUser.unitRole"
              :options="unitRoleOptions"
              label="Unit Role"
              emit-value
              map-options
              hint="Note: Assigning Leader/Deputy Leader will demote any existing holder in this unit to Member"
            />

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
      <q-card style="min-width: 1000px; border-radius: 20px; overflow: hidden;">
        <!-- Header with Gradient -->
        <q-card-section class="text-white q-pa-lg" style="background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h5 text-weight-bold">Edit User Profile</div>
              <div class="text-subtitle2 opacity-80">Manage user details and badges</div>
            </div>
            <div class="col-auto">
              <q-btn icon="close" flat round dense v-close-popup class="text-white" />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Left Column: Profile Info -->
            <div class="col-12 col-md-5 text-center">
              <div class="relative-position inline-block q-mb-md">
                <q-avatar size="120px" class="shadow-3">
                  <img :src="getAvatarUrl(editingUserData.username, editingUserData.profileImage)" style="object-fit: cover" />
                </q-avatar>
                <q-btn
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  class="absolute-bottom-right"
                  style="bottom: 5px; right: 5px;"
                  @click="$refs.fileInput.pickFiles()"
                />
                <q-file
                  ref="fileInput"
                  v-model="uploadImageFile"
                  style="display: none"
                  accept=".jpg, .png, .jpeg"
                  @update:model-value="handleImageUpdate"
                />
              </div>
              
              <div class="text-h6 q-mb-xs">{{ editingUserData.username }}</div>
              <q-chip :color="getRoleColor(editingUserData.role)" text-color="white" size="sm" class="q-mb-md">
                {{ editingUserData.role }}
              </q-chip>

              <q-input filled v-model="editingUserData.username" label="Username" dense class="q-mb-sm" />
              
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
                dense
                class="q-mb-sm"
              />

              <q-select
                v-if="editingUserData.role === 'user'"
                filled
                v-model="editingUserData.unitId"
                :options="editUnitOptions"
                label="Unit"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                dense
                class="q-mb-sm"
                clearable
                @update:model-value="val => { if(val && !editingUserData.unitRole) editingUserData.unitRole = 'member' }"
              />

              <q-select
                v-if="editingUserData.unitId"
                filled
                v-model="editingUserData.unitRole"
                :options="unitRoleOptions"
                label="Unit Role"
                emit-value
                map-options
                dense
                class="q-mb-sm"
                hint="Note: Assigning Leader/Deputy Leader will demote any existing holder to Member"
              />
            </div>

            <!-- Right Column: Badges -->
            <div class="col-12 col-md-7">
              <div class="text-subtitle1 text-weight-bold q-mb-sm flex items-center">
                <q-icon name="military_tech" class="q-mr-sm" color="primary" />
                Badges & Achievements
              </div>

              <div class="q-mb-md" style="min-height: 150px; max-height: 400px; overflow-y: auto;">
                <q-markup-table flat bordered v-if="selectedBadges.length > 0">
                  <thead>
                    <tr>
                      <th class="text-left">Badge</th>
                      <th class="text-left">Acquired Date</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(badge, index) in selectedBadges" :key="badge.id">
                      <td class="text-left">
                        <div class="row items-center">
                          <q-avatar size="32px" class="q-mr-sm">
                            <img v-if="badge.image" :src="`${config.apiUrl}${badge.image}`" style="object-fit: cover" />
                            <q-icon v-else name="star" color="primary" />
                          </q-avatar>
                          {{ badge.name }}
                        </div>
                      </td>
                      <td class="text-left">
                        <div class="cursor-pointer text-primary row items-center">
                          <q-icon name="event" class="q-mr-xs" />
                          {{ formatDate(badge.acquiredAt) }}
                          <q-popup-proxy 
                            cover 
                            transition-show="scale" 
                            transition-hide="scale"
                            :ref="(el) => { if(el) dateProxies[index] = el }"
                          >
                            <q-date 
                              v-model="badge.acquiredAt" 
                              mask="YYYY-MM-DD"
                              @update:model-value="() => dateProxies[index]?.hide()"
                            >
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Close" color="primary" flat />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </div>
                      </td>
                      <td class="text-right">
                        <q-btn
                          round
                          flat
                          color="negative"
                          icon="close"
                          size="sm"
                          @click="removeBadgeFromSelection(index)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
                <div v-else class="text-grey text-center q-pa-lg bg-grey-2 rounded-borders">
                  No badges awarded yet.
                </div>
              </div>

              <q-select
                filled
                v-model="badgeToAdd"
                :options="badgeOptions"
                option-label="name"
                option-value="id"
                label="Add Badge"
                emit-value
                map-options
                use-input
                input-debounce="0"
                @filter="filterBadges"
                @update:model-value="addBadgeToSelection"
                dense
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
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
        
        <q-separator />
        
        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn label="Cancel" flat color="grey-8" v-close-popup @click="cancelEdit" />
          <q-btn label="Save Changes" color="primary" unelevated @click="saveUserEdit" />
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
import { useUnitStore } from '../../stores/unit';
import { useQuasar } from 'quasar';
import { config } from '../../config';
import { api } from '../../api';
import { getAvatarUrl } from '../../utils/avatar';
import { date } from 'quasar';

const userStore = useUserStore();
const badgeStore = useBadgeStore();
const unitStore = useUnitStore();
const authStore = useAuthStore();
const $q = useQuasar();

const baseColumns = [
  { name: 'profileImage', label: 'Profile Image', field: 'profileImage', align: 'center' },
  { name: 'username', label: 'Username', field: 'username', sortable: true, align: 'left' },
  { name: 'role', label: 'Role', field: 'role', sortable: true, align: 'center' },
  { name: 'location', label: 'Location', field: row => row.location?.name || 'N/A', sortable: true, align: 'left' },
  { name: 'unit', label: 'Unit', field: row => row.unit?.name || 'N/A', sortable: true, align: 'left' },
  { name: 'unitRole', label: 'Unit Role', field: 'unitRole', sortable: true, align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
];

const columns = computed(() => {
  // Filter out location column for non-super admins
  if (!authStore.isSuperAdmin) {
    return baseColumns.filter(col => col.name !== 'location');
  }
  return baseColumns;
});

const users = ref([]);
const badges = ref([]);
const units = ref([]);
const locationOptions = ref([]); // For dropdown
const createDialog = ref(false);
const editDialog = ref(false);
const editingUserData = ref(null);
const filter = ref('');
const roleFilter = ref(null);
const locationFilter = ref(null);
const unitFilter = ref(null);
const unitRoleFilter = ref(null);

const roleFilterOptions = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' }
];

const unitRoleFilterOptions = [
  { label: 'Leader', value: 'leader' },
  { label: 'Deputy Leader', value: 'deputy_leader' },
  { label: 'Member', value: 'member' }
];
const originalUserData = ref(null);
const hoveredBadge = ref(null);
const uploadImageFile = ref(null);
const selectedBadges = ref([]);
const badgeToAdd = ref(null);
const dateProxies = ref([]);


const newUser = ref({
  username: '',
  password: '',
  locationName: '',
  role: 'user',
  unitId: null,
  unitRole: 'member'
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

const unitRoleOptions = [
  { label: 'Member', value: 'member' },
  { label: 'Deputy Leader', value: 'deputy_leader' },
  { label: 'Leader', value: 'leader' }
];

const filteredUsers = computed(() => {
  let result = users.value;
  
  // Filter by role (super admin only)
  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value.value);
  }
  
  // Filter by location (super admin only)
  if (locationFilter.value) {
    result = result.filter(user => user.location?.name === locationFilter.value);
  }
  
  // Filter by unit
  if (unitFilter.value) {
    result = result.filter(user => user.unit?.id === unitFilter.value);
  }
  
  // Filter by unit role
  if (unitRoleFilter.value) {
    result = result.filter(user => user.unitRole === unitRoleFilter.value.value);
  }
  
  return result;
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

const unitOptions = computed(() => units.value);

const createUnitOptions = computed(() => {
  if (authStore.isSuperAdmin) {
    return newUser.value.locationName ? units.value.filter(u => u.location?.name === newUser.value.locationName) : [];
  } else {
    const myLoc = authStore.user?.location?.name;
    return myLoc ? units.value.filter(u => u.location?.name === myLoc) : [];
  }
});

const editUnitOptions = computed(() => {
  if (!editingUserData.value?.locationName) return [];
  return units.value.filter(u => u.location?.name === editingUserData.value.locationName);
});

const loadData = async () => {
  try {
    await userStore.fetchUsers();
    users.value = userStore.users;
    
    await badgeStore.fetchBadges();
    badges.value = badgeStore.badges;

    await unitStore.fetchUnits();
    units.value = unitStore.units;
    
    if (authStore.isSuperAdmin) {
      const locResponse = await api.get('/locations');
      locationOptions.value = locResponse.data;
    } else {
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
  editingUserData.value.locationName = user.location?.name;
  editingUserData.value.unitId = user.unit?.id;
  editingUserData.value.unitRole = user.unitRole || 'member';
  
  selectedBadges.value = user.badges ? user.badges.map(b => ({
    ...b,
    acquiredAt: b.acquiredAt ? new Date(b.acquiredAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  })) : [];
  
  originalUserData.value = JSON.parse(JSON.stringify(user));
  uploadImageFile.value = null;
  editDialog.value = true;
};

const cancelEdit = () => {
  editingUserData.value = null;
  originalUserData.value = null;
  uploadImageFile.value = null;
  selectedBadges.value = [];
  badgeToAdd.value = null;
  dateProxies.value = [];
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
  if (uploadImageFile.value) {
    const imageSuccess = await userStore.uploadUserImage(editingUserData.value.id, uploadImageFile.value);
    if (!imageSuccess) {
      $q.notify({ color: 'negative', message: 'Failed to upload image', icon: 'report_problem' });
      return;
    }
  }

  const result = await userStore.updateUser(editingUserData.value.id, {
    username: editingUserData.value.username,
    locationName: editingUserData.value.locationName,
    unit: editingUserData.value.unitId ? { id: editingUserData.value.unitId } : null,
    unitRole: editingUserData.value.unitId ? editingUserData.value.unitRole : null
  });

  if (!result) {
    $q.notify({ color: 'negative', message: 'Failed to update user info', icon: 'report_problem' });
    return;
  }

  // Check for demotion
  if (result.demotedUser) {
    const roleLabel = formatUnitRole(result.demotedUser.role);
    $q.notify({ 
      color: 'info', 
      message: `Note: User "${result.demotedUser.username}" was demoted from ${roleLabel} to Member`,
      icon: 'info',
      timeout: 5000
    });
  }

  const originalBadges = originalUserData.value.badges || [];
  const currentBadges = selectedBadges.value;

  const removedBadges = originalBadges.filter(ob => !currentBadges.find(cb => cb.id === ob.id));
  for (const badge of removedBadges) {
    await userStore.removeBadge(editingUserData.value.id, badge.id);
  }

  const addedBadges = currentBadges.filter(cb => !originalBadges.find(ob => ob.id === cb.id));
  for (const badge of addedBadges) {
    await userStore.assignBadge(editingUserData.value.id, badge.id, badge.acquiredAt);
  }

  const existingBadges = currentBadges.filter(cb => originalBadges.find(ob => ob.id === cb.id));
  for (const badge of existingBadges) {
    const original = originalBadges.find(ob => ob.id === badge.id);
    const originalDate = original.acquiredAt ? new Date(original.acquiredAt).toISOString().split('T')[0] : '';
    const newDate = badge.acquiredAt;
    
    if (originalDate !== newDate) {
      await userStore.updateBadgeDate(editingUserData.value.id, badge.id, badge.acquiredAt);
    }
  }

  $q.notify({ color: 'positive', message: 'User updated successfully', icon: 'check' });
  editDialog.value = false;
  await loadData();
};

const getBadgeById = (id) => {
  return badges.value.find(b => b.id === id);
};

const removeBadgeFromSelection = (index) => {
  selectedBadges.value.splice(index, 1);
};

const addBadgeToSelection = (badgeId) => {
  if (!badgeId) return;
  const badge = badges.value.find(b => b.id === badgeId);
  if (badge) {
    if (!selectedBadges.value.find(b => b.id === badge.id)) {
      selectedBadges.value.push({
        ...badge,
        acquiredAt: new Date().toISOString().split('T')[0]
      });
    }
  }
  badgeToAdd.value = null;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return date.formatDate(dateString, 'MMM D, YYYY');
};

const handleImageUpdate = (file) => {
  if (file) {
    editingUserData.value.profileImage = URL.createObjectURL(file);
  }
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
    const result = await userStore.createUser({
      username: newUser.value.username,
      password: newUser.value.password,
      locationName: newUser.value.locationName,
      role: newUser.value.role,
      unit: newUser.value.unitId ? { id: newUser.value.unitId } : null,
      unitRole: newUser.value.unitId ? newUser.value.unitRole : null
    });
    
    if (result) {
      $q.notify({ color: 'positive', message: 'User created successfully', icon: 'check' });
      
      // Check for demotion
      if (result.demotedUser) {
        const roleLabel = formatUnitRole(result.demotedUser.role);
        $q.notify({ 
          color: 'info', 
          message: `Note: User "${result.demotedUser.username}" was demoted from ${roleLabel} to Member`,
          icon: 'info',
          timeout: 5000
        });
      }
      
      createDialog.value = false;
      
      newUser.value = {
        username: '',
        password: '',
        locationName: '',
        role: 'user',
        unitId: null,
        unitRole: 'member'
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

const getUnitRoleColor = (unitRole) => {
  switch(unitRole) {
    case 'leader': return 'deep-purple';
    case 'deputy_leader': return 'purple';
    case 'member': return 'grey';
    default: return 'grey';
  }
};

const formatUnitRole = (unitRole) => {
  switch(unitRole) {
    case 'leader': return 'Leader';
    case 'deputy_leader': return 'Deputy Leader';
    case 'member': return 'Member';
    default: return unitRole;
  }
};
</script>


