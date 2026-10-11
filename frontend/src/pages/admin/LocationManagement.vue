<template>
  <q-page class="tf-page locations-page">
    <!-- Hero Header -->
    <PageHeader 
      icon="location_on"
      :title="$t('locationManagement.title')"
      :subtitle="$t('locationManagement.subtitle')"
    />

    <!-- Content -->
    <div>
      <q-card flat bordered>
        <q-table
          :title="$t('locationManagement.tableTitle')"
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
              <q-input outlined dense debounce="300" v-model="filter" :placeholder="$t('locationManagement.searchPlaceholder')" data-cy="search-input">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-btn color="primary" icon="add" :label="$t('locationManagement.addButton')" @click="showAddDialog = true" data-cy="create-location-btn" />
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
                data-cy="edit-btn"
              >
                <q-tooltip>{{ $t('locationManagement.tooltips.edit') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="info"
                icon="visibility"
                :to="`/locations/${props.row.id}`"
                :aria-label="$t('locationManagement.tooltips.view')"
                data-cy="view-btn"
              >
                <q-tooltip>{{ $t('locationManagement.tooltips.view') }}</q-tooltip>
              </q-btn>
              <q-btn 
                flat 
                round 
                dense
                color="negative" 
                icon="delete" 
                @click="confirmDelete(props.row)"
                data-cy="delete-btn"
              >
                <q-tooltip>{{ $t('locationManagement.tooltips.delete') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showAddDialog">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section class="row items-center no-wrap q-gutter-sm">
          <div class="tf-tile"><q-icon name="location_city" size="22px" /></div>
          <div class="col text-h6 text-weight-bold">
            {{ isEditing ? $t('locationManagement.dialog.editTitle') : $t('locationManagement.dialog.addTitle') }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />

        <q-card-section class="q-pt-md">
          <q-input 
            outlined
            v-model="locationForm.name" 
            :label="$t('locationManagement.form.name')" 
            autofocus 
            @keyup.enter="saveLocation"
            :rules="[val => !!val || $t('locationManagement.form.required')]"
            data-cy="location-name-input"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="place" />
            </template>
          </q-input>

          <q-select
            outlined
            v-model="locationForm.type"
            :options="locationTypeOptions"
            :label="$t('locationManagement.form.type')"
            emit-value
            map-options
            class="q-mb-md"
            data-cy="location-type-select"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>

          <!-- Interactive Map for Coordinates -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('locationManagement.form.coordinates') }}</div>
            <LocationMapPicker 
              v-model="mapCoordinates"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="$t('general.cancel')" flat v-close-popup />
          <q-btn 
            :label="$t('general.save')" 
            color="primary" 
            unelevated
            @click="saveLocation"
            icon="save"
            data-cy="save-location-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/api';
import { useQuasar } from 'quasar';
import PageHeader from '@/components/PageHeader.vue';
import LocationMapPicker from '@/components/LocationMapPicker.vue';

const $q = useQuasar();
const { t } = useI18n();
const locations = ref([]);
const loading = ref(false);
const showAddDialog = ref(false);
const isEditing = ref(false);
const locationForm = reactive({ id: null, name: '', type: 'guides', latitude: null, longitude: null });

const locationTypeOptions = computed(() => [
  { label: t('locationManagement.types.guides'), value: 'guides' },
  { label: t('locationManagement.types.navalGuides'), value: 'naval-guides' },
]);

// Computed property for map coordinates (two-way binding)
const mapCoordinates = computed({
  get: () => ({
    latitude: locationForm.latitude,
    longitude: locationForm.longitude
  }),
  set: (value) => {
    locationForm.latitude = value.latitude;
    locationForm.longitude = value.longitude;
  }
});

const columns = computed(() => [
  { name: 'name', label: t('locationManagement.columns.name'), field: 'name', sortable: true, align: 'left' },
  { name: 'type', label: t('locationManagement.columns.type'), field: row => t(`locationManagement.types.${row.type === 'naval-guides' ? 'navalGuides' : 'guides'}`), sortable: true, align: 'left' },
  { name: 'actions', label: t('locationManagement.columns.actions'), field: 'actions', align: 'right' },
]);

const filter = ref('');

const fetchLocations = async () => {
  loading.value = true;
  try {
    const response = await api.get('/locations');
    locations.value = response.data;
  } catch (error) {
    console.error('Failed to fetch locations', error);
    $q.notify({ type: 'negative', message: t('locationManagement.notifications.fetchError') });
  } finally {
    loading.value = false;
  }
};

const saveLocation = async () => {
  if (!locationForm.name) {
    $q.notify({ type: 'warning', message: t('locationManagement.notifications.enterName') });
    return;
  }

  try {
    const payload = {
      name: locationForm.name,
      type: locationForm.type,
      latitude: locationForm.latitude,
      longitude: locationForm.longitude,
    };

    if (isEditing.value) {
      await api.patch(`/locations/${locationForm.id}`, payload);
      $q.notify({ type: 'positive', message: t('locationManagement.notifications.updateSuccess'), icon: 'check' });
    } else {
      await api.post('/locations', payload);
      $q.notify({ type: 'positive', message: t('locationManagement.notifications.createSuccess'), icon: 'check' });
    }
    showAddDialog.value = false;
    fetchLocations();
    resetForm();
  } catch (error) {
    console.error('Failed to save location', error);
    $q.notify({ type: 'negative', message: t('locationManagement.notifications.saveError'), icon: 'report_problem' });
  }
};

const editLocation = (location) => {
  locationForm.id = location.id;
  locationForm.name = location.name;
  locationForm.type = location.type || 'guides';
  locationForm.latitude = location.latitude ? Number(location.latitude) : null;
  locationForm.longitude = location.longitude ? Number(location.longitude) : null;
  locationForm.createdAt = location.createdAt;
  isEditing.value = true;
  showAddDialog.value = true;
};

const confirmDelete = (location) => {
  $q.dialog({
    title: t('locationManagement.delete.title'),
    message: t('locationManagement.delete.message', { name: location.name }),
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(async () => {
    try {
      await api.delete(`/locations/${location.id}`);
      $q.notify({ type: 'positive', message: t('locationManagement.notifications.deleteSuccess'), icon: 'check' });
      fetchLocations();
    } catch (error) {
      console.error('Failed to delete location', error);
      $q.notify({ type: 'negative', message: t('locationManagement.notifications.deleteError'), icon: 'report_problem' });
    }
  });
};

const resetForm = () => {
  locationForm.id = null;
  locationForm.name = '';
  locationForm.type = 'guides';
  locationForm.latitude = null;
  locationForm.longitude = null;
  locationForm.createdAt = null;
  isEditing.value = false;
};

onMounted(fetchLocations);
</script>

<style scoped>
.locations-page {
  min-height: 100vh;
}


</style>
