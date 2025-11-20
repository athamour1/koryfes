<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <h1 class="text-h4 q-my-none">Location Management</h1>
      <q-btn color="primary" icon="add" label="Add Location" @click="showAddDialog = true" />
    </div>

    <q-table
      :rows="locations"
      :columns="columns"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="edit" @click="editLocation(props.row)" />
          <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Location' : 'Add Location' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="locationForm.name" label="Location Name" autofocus @keyup.enter="saveLocation" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Save" @click="saveLocation" />
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
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
];

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
  try {
    if (isEditing.value) {
      await api.patch(`/locations/${locationForm.id}`, { name: locationForm.name });
      $q.notify({ type: 'positive', message: 'Location updated' });
    } else {
      await api.post('/locations', { name: locationForm.name });
      $q.notify({ type: 'positive', message: 'Location created' });
    }
    showAddDialog.value = false;
    fetchLocations();
    resetForm();
  } catch (error) {
    console.error('Failed to save location', error);
    $q.notify({ type: 'negative', message: 'Failed to save location' });
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
    title: 'Confirm',
    message: `Are you sure you want to delete ${location.name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/locations/${location.id}`);
      $q.notify({ type: 'positive', message: 'Location deleted' });
      fetchLocations();
    } catch (error) {
      console.error('Failed to delete location', error);
      $q.notify({ type: 'negative', message: 'Failed to delete location' });
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
