<template>
  <q-page class="tf-page users-page">
    <!-- Hero Header -->
    <PageHeader 
      icon="people"
      :title="$t('adminUsers.title')"
      :subtitle="$t('adminUsers.subtitle')"
    />

    <!-- Content -->
    <div>

      <q-card flat bordered>
        <q-table
      :title="$t('adminUsers.tableTitle')"
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
              <div class="text-h6 q-mr-md gt-sm">{{ $t('adminUsers.tableTitle') }}</div>
              
              <!-- Search -->
              <div class="col-12 col-sm-auto">
                <q-input outlined dense debounce="300" v-model="filter" :placeholder="$t('adminUsers.searchPlaceholder')" class="search-input" data-cy="search-input">
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
                  :label="$t('adminUsers.filters.role')"
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
                  :label="$t('adminUsers.filters.location')"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                  data-cy="location-filter"
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
                  :label="$t('adminUsers.filters.unit')"
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
                  :label="$t('adminUsers.filters.unitRole')"
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
              <q-btn color="primary" icon="add" :label="$t('adminUsers.actions.create')" @click="openCreateDialog" class="full-width-mobile" data-cy="create-user-btn" />
            </div>
          </div>
        </div>
      </template>

      <template v-slot:body-cell-profileImage="props">
        <q-td :props="props">
          <div class="avatar-wrapper" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 40px; height: 40px;">
            <AvatarDisplay :config="props.row.avatarConfig" size="40px" :key="`avatar-${props.row.id}`" />
          </div>
        </q-td>
      </template>
      
      <template v-slot:body-cell-username="props">
        <q-td :props="props">
          <div style="overflow: hidden; white-space: nowrap; font-size: 0.875rem;">
            {{ props.row.username }}
          </div>
        </q-td>
      </template>
      
      <template v-slot:body-cell-role="props">
        <q-td :props="props">
           <q-chip
             dense
             square
             :color="props.row.role === 'user' ? 'grey-2' : 'primary'"
             :text-color="props.row.role === 'user' ? 'grey-9' : 'white'"
             :icon="props.row.role === 'user' ? 'person' : 'shield'"
           >
             {{ formatRole(props.row.role) }}
           </q-chip>
        </q-td>
      </template>
      
      <template v-slot:body-cell-location="props">
        <q-td :props="props">
           <q-chip v-if="props.row.location" dense square color="grey-2" text-color="grey-9" icon="place">
             {{ props.row.location.name }}
           </q-chip>
           <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-unit="props">
        <q-td :props="props">
           <q-chip v-if="props.row.unit" dense square color="grey-2" text-color="grey-9" icon="groups">
             {{ props.row.unit.name }}
           </q-chip>
           <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-unitRole="props">
        <q-td :props="props">
          <q-chip
            v-if="props.row.unit && props.row.unitRole"
            dense
            square
            :color="props.row.unitRole === 'member' ? 'grey-2' : 'primary'"
            :text-color="props.row.unitRole === 'member' ? 'grey-9' : 'white'"
          >
            {{ formatUnitRole(props.row.unitRole) }}
          </q-chip>
          <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row justify-end no-wrap">
            <q-btn flat dense round color="primary" icon="edit" @click="openEditDialog(props.row)" data-cy="edit-btn">
              <q-tooltip>{{ $t('adminUsers.actions.edit') }}</q-tooltip>
            </q-btn>
            <q-btn flat dense round color="info" icon="visibility" :to="'/user/' + props.row.id" data-cy="view-profile-btn">
              <q-tooltip>{{ $t('adminUsers.actions.viewProfile') }}</q-tooltip>
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
              <q-tooltip v-if="props.row.id === authStore.user?.id">{{ $t('adminUsers.actions.cannotDeleteSelf') }}</q-tooltip>
              <q-tooltip v-else>{{ $t('adminUsers.actions.delete') }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
          <q-icon size="2em" :name="filter ? 'search_off' : 'people_outline'" />
          <span>
            {{ filter ? $t('adminUsers.noData.search') : $t('adminUsers.noData.empty') }}
          </span>
        </div>
      </template>
        </q-table>
      </q-card>
    </div>

    <!-- Create User Dialog -->
    <q-dialog v-model="createDialog">
      <q-card style="width: 400px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ $t('adminUsers.dialog.createTitle') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="createUser" class="q-gutter-md">
            <q-input outlined v-model="newUser.username" :label="$t('adminUsers.form.username')" :rules="[val => !!val || $t('adminUsers.form.required')]" data-cy="username-input" />
            <q-input outlined v-model="newUser.password" :label="$t('adminUsers.form.password')" type="password" :rules="[val => !!val || $t('adminUsers.form.required')]" data-cy="password-input" />
            
            <!-- Role Selection (Super Admin only) -->
            <q-select
              outlined
              v-model="newUser.role"
              :options="availableRoleOptions"
              :label="$t('adminUsers.filters.role')"
              emit-value
              map-options
              @update:model-value="val => { if(val !== 'user') { newUser.unitId = null; newUser.unitRole = null; } }"
            />
            
            <!-- Location Selection -->
            <q-select
              v-if="authStore.isSuperAdmin"
              outlined
              v-model="newUser.locationName"
              :options="locationOptions"
              :label="$t('adminUsers.filters.location')"
              option-label="name"
              option-value="name"
              emit-value
              map-options
              new-value-mode="add-unique"
            />
            <q-input v-else outlined :model-value="authStore.user?.location?.name || $t('adminUsers.form.myLocation')" :label="$t('adminUsers.filters.location')" readonly :hint="$t('adminUsers.form.locationLocked')" />

            <!-- Unit Selection -->
            <q-select
              v-if="newUser.role === 'user'"
              outlined
              v-model="newUser.unitId"
              :options="createUnitOptions"
              :label="$t('adminUsers.filters.unit')"
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
              outlined
              v-model="newUser.unitRole"
              :options="unitRoleOptions"
              :label="$t('adminUsers.filters.unitRole')"
              emit-value
              map-options
              :hint="$t('adminUsers.form.unitRoleHint')"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('general.cancel')" flat v-close-popup />
              <q-btn :label="$t('general.create')" type="submit" color="primary" data-cy="save-user-btn" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Edit User Dialog -->
    <q-dialog v-model="editDialog">
      <q-card style="width: 1000px; max-width: 95vw; overflow: hidden; display: flex; flex-direction: column; max-height: 90vh;">
        <q-card-section class="row items-center no-wrap q-gutter-sm">
          <div class="tf-tile"><q-icon name="manage_accounts" size="22px" /></div>
          <div class="col">
            <div class="text-h6 text-weight-bold">{{ $t('adminUsers.dialog.editTitle') }}</div>
            <div class="text-caption text-grey-7">{{ $t('adminUsers.dialog.editSubtitle') }}</div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />

        <q-card-section class="q-pa-lg scroll">
          <div class="row q-col-gutter-lg">
            <!-- Left Column: Profile Info -->
            <div class="col-12 text-center" :class="editingUserData.role === 'user' ? 'col-md-5' : 'col-md-12'">
              <div class="relative-position inline-block q-mb-md">
                <q-avatar size="120px" class="shadow-3">
                  <AvatarDisplay :config="editingUserData.avatarConfig" size="120px" :key="`avatar-edit-${editingUserData.id}`" />
                </q-avatar>
              </div>
              
              <div class="text-h6 q-mb-xs">{{ editingUserData.username }}</div>
              <q-chip
                dense
                square
                class="q-mb-md"
                :color="editingUserData.role === 'user' ? 'grey-2' : 'primary'"
                :text-color="editingUserData.role === 'user' ? 'grey-9' : 'white'"
              >
                {{ formatRole(editingUserData.role) }}
              </q-chip>

              <q-input outlined v-model="editingUserData.username" :label="$t('adminUsers.form.username')" dense class="q-mb-sm" />
              
              <q-select
                v-if="authStore.isSuperAdmin"
                outlined
                v-model="editingUserData.locationName"
                :options="locationOptions"
                :label="$t('adminUsers.filters.location')"
                option-label="name"
                option-value="name"
                emit-value
                map-options
                dense
                class="q-mb-sm"
              />

              <q-select
                v-if="editingUserData.role === 'user'"
                outlined
                v-model="editingUserData.unit"
                :options="editUnitOptions"
                :label="$t('adminUsers.filters.unit')"
                option-label="name"
                option-value="id"
                dense
                class="q-mb-sm"
                clearable
                @update:model-value="val => { if(val && !editingUserData.unitRole) editingUserData.unitRole = 'member' }"
              />

              <q-select
                v-if="editingUserData.role === 'user' && editingUserData.unit"
                outlined
                v-model="editingUserData.unitRole"
                :options="unitRoleOptions"
                :label="$t('adminUsers.filters.unitRole')"
                emit-value
                map-options
                dense
                class="q-mb-sm"
                :hint="$t('adminUsers.form.unitRoleHint')"
              />
            </div>

            <!-- Right Column: Individual Progress -->
            <div class="col-12 col-md-7" v-if="editingUserData.role === 'user'">
              <ProgressManager :user-id="editingUserData.id" />
            </div>
          </div>
        </q-card-section>
        <!-- Action Buttons -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="$t('general.cancel')" color="grey-7" v-close-popup />
          <q-btn unelevated :label="$t('general.save')" color="primary" @click="saveUserChanges" icon="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { useUnitStore } from '@/stores/unit';
import { api } from '@/api';
import { useQuasar } from 'quasar';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import PageHeader from '@/components/PageHeader.vue';
import ProgressManager from '@/components/progress/ProgressManager.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const unitStore = useUnitStore();
const $q = useQuasar();
const { t } = useI18n();

const columns = computed(() => [
  { name: 'profileImage', label: '', field: 'profileImage', align: 'center', style: 'width: 60px; min-width: 60px; max-width: 60px;' },
  { name: 'username', label: t('adminUsers.columns.username'), field: 'username', sortable: true, align: 'left', style: 'width: 40%;' },
  { name: 'role', label: t('adminUsers.columns.role'), field: 'role', sortable: true, align: 'center' },
  { name: 'location', label: t('adminUsers.columns.location'), field: row => row.location?.name || '-', sortable: true, align: 'left' },
  { name: 'unit', label: t('adminUsers.columns.unit'), field: row => row.unit?.name || '-', sortable: true, align: 'left' },
  { name: 'unitRole', label: t('adminUsers.columns.unitRole'), field: 'unitRole', sortable: true, align: 'center' },
  { name: 'actions', label: t('adminUsers.columns.actions'), field: 'actions', align: 'right' }
]);

const filter = ref('');
const roleFilter = ref(null);
const locationFilter = ref(null);
const unitFilter = ref(null);
const unitRoleFilter = ref(null);

const createDialog = ref(false);
const editDialog = ref(false);
const newUser = ref({ username: '', password: '', role: 'user', locationName: '', unitId: null, unitRole: null });
const editingUserData = ref({});

const locationOptions = ref([]);

const roleFilterOptions = [
  { label: t('adminUsers.roles.all'), value: null },
  { label: t('adminUsers.roles.superAdmin'), value: 'super_admin' },
  { label: t('adminUsers.roles.admin'), value: 'admin' },
  { label: t('adminUsers.roles.user'), value: 'user' }
];

const availableRoleOptions = computed(() => {
  const options = [
    { label: t('adminUsers.roles.user'), value: 'user' },
    { label: t('adminUsers.roles.admin'), value: 'admin' }
  ];
  if (authStore.isSuperAdmin) {
    options.push({ label: t('adminUsers.roles.superAdmin'), value: 'super_admin' });
  }
  return options;
});

const unitRoleFilterOptions = [
  { label: t('adminUsers.roles.all'), value: null },
  { label: t('adminUsers.roles.leader'), value: 'leader' },
  { label: t('adminUsers.roles.deputyLeader'), value: 'deputy_leader' },
  { label: t('adminUsers.roles.member'), value: 'member' }
];

const unitRoleOptions = [
  { label: t('adminUsers.roles.leader'), value: 'leader' },
  { label: t('adminUsers.roles.deputyLeader'), value: 'deputy_leader' },
  { label: t('adminUsers.roles.member'), value: 'member' }
];

const unitOptions = computed(() => {
  return unitStore.units.map(u => ({ id: u.id, name: u.name }));
});

// Filter units for create/edit based on location
const createUnitOptions = computed(() => {
  if (!newUser.value.locationName && !authStore.user?.location?.name) return [];
  const locName = newUser.value.locationName || authStore.user?.location?.name;
  return unitStore.units.filter(u => u.location?.name === locName).map(u => ({ id: u.id, name: u.name }));
});

const editUnitOptions = computed(() => {
  if (!editingUserData.value.locationName) return [];
  return unitStore.units.filter(u => u.location?.name === editingUserData.value.locationName).map(u => ({ id: u.id, name: u.name }));
});

const filteredUsers = computed(() => {
  let users = userStore.users;

  if (roleFilter.value) {
    users = users.filter(u => u.role === roleFilter.value);
  }

  if (locationFilter.value) {
    users = users.filter(u => u.location?.name === locationFilter.value);
  }

  if (unitFilter.value) {
    users = users.filter(u => u.unit?.id === unitFilter.value);
  }

  if (unitRoleFilter.value) {
    users = users.filter(u => u.unitRole === unitRoleFilter.value);
  }

  return users;
});

const fetchLocations = async () => {
  try {
    const response = await api.get('/locations');
    locationOptions.value = response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

onMounted(async () => {
  await userStore.fetchUsers();
  await unitStore.fetchUnits();
  await fetchLocations();
});

const openCreateDialog = () => {
  newUser.value = { username: '', password: '', role: 'user', locationName: '', unitId: null, unitRole: null };
  createDialog.value = true;
};

const openEditDialog = async (user) => {
  editingUserData.value = { 
    ...user, 
    locationName: user.location?.name,
    unit: user.unit ? { id: user.unit.id, name: user.unit.name } : null
  };

  editDialog.value = true;
};

const createUser = async () => {
  const payload = { ...newUser.value };
  
  // Handle location logic
  if (!authStore.isSuperAdmin) {
    payload.locationName = authStore.user?.location?.name;
  }
  
  // Clean up unit data if not a user
  if (payload.role !== 'user') {
    delete payload.unitId;
    delete payload.unitRole;
  }

  const success = await userStore.createUser(payload);
  if (success) {
    $q.notify({ color: 'positive', message: t('adminUsers.notifications.createSuccess'), icon: 'check' });
    createDialog.value = false;
    await userStore.fetchUsers();
  } else {
    $q.notify({ color: 'negative', message: userStore.error || t('adminUsers.notifications.createError'), icon: 'report_problem' });
  }
};



const saveUserChanges = async () => {
  try {
    const updateData = {
      username: editingUserData.value.username,
      locationName: editingUserData.value.locationName
    };

    // Only add unit fields for regular users, not for admins
    if (editingUserData.value.role === 'user') {
      updateData.unit = editingUserData.value.unit ? { id: editingUserData.value.unit.id } : null;
      updateData.unitRole = editingUserData.value.unitRole;
    }

    const success = await userStore.updateUser(editingUserData.value.id, updateData);
    if (success) {
      $q.notify({ color: 'positive', message: t('adminUsers.notifications.updateSuccess') || 'User updated successfully', icon: 'check' });
      editDialog.value = false;
      await userStore.fetchUsers();
    } else {
      $q.notify({ color: 'negative', message: userStore.error || t('adminUsers.notifications.updateError') || 'Error updating user', icon: 'report_problem' });
    }
  } catch (error) {
    console.error('Error saving user changes:', error);
    $q.notify({ color: 'negative', message: t('adminUsers.notifications.updateError') || 'Error updating user', icon: 'report_problem' });
  }
};


const confirmDeleteUser = (user) => {
  $q.dialog({
    title: t('adminUsers.delete.title'),
    message: t('adminUsers.delete.message', { username: user.username }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const success = await userStore.deleteUser(user.id);
    if (success) {
      $q.notify({ color: 'positive', message: t('adminUsers.notifications.deleteSuccess'), icon: 'check' });
    } else {
      $q.notify({ color: 'negative', message: userStore.error || t('adminUsers.notifications.deleteError'), icon: 'report_problem' });
    }
  });
};

const formatRole = (role) => ({
  super_admin: t('adminUsers.rolesShort.superAdmin'),
  admin: t('adminUsers.rolesShort.admin'),
  user: t('adminUsers.rolesShort.user'),
}[role] || role);

const formatUnitRole = (role) => {
  if (!role) return '-';
  switch(role) {
    case 'leader': return t('adminUsers.roles.leader');
    case 'deputy_leader': return t('adminUsers.roles.deputyLeader');
    case 'member': return t('adminUsers.roles.member');
    default: return role;
  }
};

</script>

<style scoped>
/* On mobile, keep the PageHeader hidden (already handled by PageHeader component) */
/* The search functionality is already visible in the table's top slot */
@media (max-width: 768px) {
  .hero-header-wrapper {
    display: none;
  }
}
</style>
