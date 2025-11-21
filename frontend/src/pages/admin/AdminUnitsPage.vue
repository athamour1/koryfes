<template>
  <q-page class="units-page">
    <!-- Hero Header -->
    <div class="q-pa-md">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1200px; margin: 0 auto;">
        <div class="text-center" style="max-width: 800px; margin: 0 auto;">
          <q-icon name="groups" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold q-mb-sm">Unit Management</div>
          <div class="text-body1" style="opacity: 0.9;">Manage scout units and their members</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="q-pa-lg" style="max-width: 1200px; margin: 0 auto;">

      <q-card flat bordered>
        <q-table
      title="Units"
      :rows="units"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
      :filter="filter"
      :loading="loading"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="add" label="Create New Unit" class="q-ml-md" @click="openCreateDialog" />
      </template>

      <template v-slot:body-cell-flag="props">
        <q-td :props="props">
          <q-avatar size="40px">
            <img v-if="props.row.flag" :src="`${config.apiUrl}${props.row.flag}`" style="object-fit: cover" />
            <q-icon v-else name="flag" color="primary" />
          </q-avatar>
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
            @click="confirmDeleteUnit(props.row)" 
          />
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
          <q-icon size="2em" :name="filter ? 'search_off' : 'groups'" />
          <span>
            {{ filter ? 'No units match your search' : 'No units created yet' }}
          </span>
        </div>
      </template>
        </q-table>
      </q-card>
    </div>

    <!-- Create/Edit Unit Dialog -->
    <q-dialog v-model="unitDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Unit' : 'Create New Unit' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveUnit" class="q-gutter-md">
            <div class="row justify-center q-mb-md">
              <div class="relative-position inline-block">
                <q-avatar size="100px" class="shadow-3">
                  <img v-if="previewImage || unitForm.flag" :src="previewImage || `${config.apiUrl}${unitForm.flag}`" style="object-fit: cover" />
                  <q-icon v-else name="flag" color="grey-4" size="60px" />
                </q-avatar>
                <q-btn
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  class="absolute-bottom-right"
                  style="bottom: -5px; right: -5px;"
                  @click="$refs.fileInput.pickFiles()"
                />
                <q-file
                  ref="fileInput"
                  v-model="uploadFile"
                  style="display: none"
                  accept=".jpg, .png, .jpeg"
                  @update:model-value="handleImagePreview"
                />
              </div>
            </div>

            <q-input filled v-model="unitForm.name" label="Unit Name" :rules="[val => !!val || 'Required']" />
            <q-input filled v-model="unitForm.description" label="Description" type="textarea" autogrow />
            
            <!-- Location Selection (Super Admin Only) -->
            <q-select
              v-if="authStore.isSuperAdmin"
              filled
              v-model="unitForm.locationId"
              :options="locations"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              label="Location"
              :rules="[val => !!val || 'Location is required']"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" />
              </template>
            </q-select>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" flat v-close-popup />
              <q-btn :label="isEditing ? 'Save Changes' : 'Create'" type="submit" color="primary" :loading="loading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUnitStore } from '../../stores/unit';
import { useAuthStore } from '../../stores/auth';
import { useQuasar } from 'quasar';
import { config } from '../../config';
import { api } from '../../api';

const unitStore = useUnitStore();
const authStore = useAuthStore();
const $q = useQuasar();

const columns = [
  { name: 'flag', label: 'Flag', field: 'flag', align: 'center' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left', format: val => val && val.length > 50 ? val.substring(0, 50) + '...' : val },
  { name: 'location', label: 'Location', field: row => row.location?.name || 'N/A', sortable: true, align: 'left' },
  { name: 'members', label: 'Members', field: row => row.users?.length || 0, sortable: true, align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
];

const filter = ref('');
const unitDialog = ref(false);
const isEditing = ref(false);
const uploadFile = ref(null);
const previewImage = ref(null);
const locations = ref([]);

const unitForm = ref({
  id: null,
  name: '',
  description: '',
  flag: null,
  locationId: null
});

const units = computed(() => unitStore.units);
const loading = computed(() => unitStore.loading);

const fetchLocations = async () => {
  try {
    const response = await api.get('/locations');
    locations.value = response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

onMounted(async () => {
  await unitStore.fetchUnits();
  if (authStore.isSuperAdmin) {
    await fetchLocations();
  }
});

const openCreateDialog = () => {
  isEditing.value = false;
  unitForm.value = { id: null, name: '', description: '', flag: null, locationId: null };
  previewImage.value = null;
  uploadFile.value = null;
  unitDialog.value = true;
};

const openEditDialog = (unit) => {
  isEditing.value = true;
  unitForm.value = { ...unit };
  previewImage.value = null;
  uploadFile.value = null;
  unitDialog.value = true;
};

const handleImagePreview = (file) => {
  if (file) {
    previewImage.value = URL.createObjectURL(file);
  }
};

const saveUnit = async () => {
  let result;
  if (isEditing.value) {
    result = await unitStore.updateUnit(unitForm.value.id, {
      name: unitForm.value.name,
      description: unitForm.value.description
    });
  } else {
    const createPayload = {
      name: unitForm.value.name,
      description: unitForm.value.description
    };
    
    // Only super admins can specify location
    if (authStore.isSuperAdmin && unitForm.value.locationId) {
      createPayload.location = { id: unitForm.value.locationId };
    }
    
    result = await unitStore.createUnit(createPayload);
  }

  if (result) {
    // Upload flag if selected
    if (uploadFile.value) {
      await unitStore.uploadUnitFlag(result.id, uploadFile.value);
    }
    
    $q.notify({ color: 'positive', message: `Unit ${isEditing.value ? 'updated' : 'created'} successfully`, icon: 'check' });
    unitDialog.value = false;
    await unitStore.fetchUnits();
  } else {
    $q.notify({ color: 'negative', message: unitStore.error || 'Operation failed', icon: 'report_problem' });
  }
};

const confirmDeleteUnit = (unit) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete unit "${unit.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const success = await unitStore.deleteUnit(unit.id);
    if (success) {
      $q.notify({ color: 'positive', message: 'Unit deleted successfully', icon: 'check' });
    } else {
      $q.notify({ color: 'negative', message: unitStore.error || 'Failed to delete unit', icon: 'report_problem' });
    }
  });
};
</script>
