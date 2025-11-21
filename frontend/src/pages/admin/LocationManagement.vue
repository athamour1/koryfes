<template>
  <q-page class="locations-page">
    <!-- Hero Header -->
    <div class="q-pa-md">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1200px; margin: 0 auto;">
        <div class="text-center" style="max-width: 800px; margin: 0 auto;">
          <q-icon name="location_on" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold q-mb-sm">Location Management</div>
          <div class="text-body1" style="opacity: 0.9;">Manage scout locations and groups</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="q-pa-lg" style="max-width: 1200px; margin: 0 auto;">
      <q-card flat bordered>
        <q-table
          title="Locations"
          :rows="locations"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
          :filter="filter"
        >
          <template v-slot:top-right>
            <div class="row q-gutter-sm items-center">
              <q-input outlined dense debounce="300" v-model="filter" placeholder="Search locations">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-btn color="primary" icon="add" label="Add Location" @click="showAddDialog = true" />
            </div>
          </template>
          <template v-slot:body-cell-id="props">
            <q-td :props="props">
              <q-chip dense color="primary" text-color="white">
                #{{ props.row.id }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="row items-center">
                <q-icon name="place" size="20px" class="q-mr-sm" color="primary" />
                <span class="text-weight-medium">{{ props.row.name }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn 
                flat 
                round 
                dense
                color="primary" 
                icon="edit" 
                @click="editLocation(props.row)"
              >
                <q-tooltip>Edit location</q-tooltip>
              </q-btn>
              <q-btn 
                flat 
                round 
                dense
                color="negative" 
                icon="delete" 
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Delete location</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="gradient-blue text-white">
          <div class="text-h6">
            <q-icon name="location_city" size="24px" class="q-mr-sm" />
            {{ isEditing ? 'Edit Location' : 'Add Location' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input 
            filled
            v-model="locationForm.name" 
            label="Location Name" 
            autofocus 
            @keyup.enter="saveLocation"
            :rules="[val => !!val || 'Location name is required']"
          >
            <template v-slot:prepend>
              <q-icon name="place" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" flat v-close-popup />
          <q-btn 
            label="Save" 
            color="primary" 
            unelevated
            @click="saveLocation"
            icon="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { api } from '../../api';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const locations = ref([]);
const loading = ref(false);
const showAddDialog = ref(false);
const isEditing = ref(false);
const locationForm = reactive({ id: null, name: '' });

const columns = [
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
];

const filter = ref('');

const fetchLocations = async () => {
  loading.value = true;
  try {
    const response = await api.get('/locations');
    locations.value = response.data;
  } catch (error) {
    console.error('Failed to fetch locations', error);
    $q.notify({ type: 'negative', message: 'Failed to fetch locations' });
  } finally {
    loading.value = false;
  }
};

const saveLocation = async () => {
  if (!locationForm.name) {
    $q.notify({ type: 'warning', message: 'Please enter a location name' });
    return;
  }

  try {
    if (isEditing.value) {
      await api.patch(`/locations/${locationForm.id}`, { name: locationForm.name });
      $q.notify({ type: 'positive', message: 'Location updated successfully', icon: 'check' });
    } else {
      await api.post('/locations', { name: locationForm.name });
      $q.notify({ type: 'positive', message: 'Location created successfully', icon: 'check' });
    }
    showAddDialog.value = false;
    fetchLocations();
    resetForm();
  } catch (error) {
    console.error('Failed to save location', error);
    $q.notify({ type: 'negative', message: 'Failed to save location', icon: 'report_problem' });
  }
};

const editLocation = (location) => {
  locationForm.id = location.id;
  locationForm.name = location.name;
  isEditing.value = true;
  showAddDialog.value = true;
};

const confirmDelete = (location) => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete "${location.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(async () => {
    try {
      await api.delete(`/locations/${location.id}`);
      $q.notify({ type: 'positive', message: 'Location deleted successfully', icon: 'check' });
      fetchLocations();
    } catch (error) {
      console.error('Failed to delete location', error);
      $q.notify({ type: 'negative', message: 'Failed to delete location', icon: 'report_problem' });
    }
  });
};

const resetForm = () => {
  locationForm.id = null;
  locationForm.name = '';
  isEditing.value = false;
};

onMounted(fetchLocations);
</script>

<style scoped>
.locations-page {
  min-height: 100vh;
}
</style>
