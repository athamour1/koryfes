<template>
  <q-page class="locations-page">
    <!-- Hero Header -->
    <div class="q-pa-md hero-header-wrapper">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1200px; margin: 0 auto;">
        <div class="text-center" style="max-width: 800px; margin: 0 auto;">
          <q-icon name="location_on" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold q-mb-sm">{{ $t('locationManagement.title') }}</div>
          <div class="text-body1" style="opacity: 0.9;">{{ $t('locationManagement.subtitle') }}</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="q-pa-lg" style="max-width: 1200px; margin: 0 auto;">
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
              <q-input outlined dense debounce="300" v-model="filter" :placeholder="$t('locationManagement.searchPlaceholder')">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-btn color="primary" icon="add" :label="$t('locationManagement.addButton')" @click="showAddDialog = true" />
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
                <q-tooltip>{{ $t('locationManagement.tooltips.edit') }}</q-tooltip>
              </q-btn>
              <q-btn 
                flat 
                round 
                dense
                color="negative" 
                icon="delete" 
                @click="confirmDelete(props.row)"
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
      <q-card style="min-width: 400px">
        <q-card-section class="gradient-blue text-white">
          <div class="text-h6">
            <q-icon name="location_city" size="24px" class="q-mr-sm" />
            {{ isEditing ? $t('locationManagement.dialog.editTitle') : $t('locationManagement.dialog.addTitle') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input 
            filled
            v-model="locationForm.name" 
            :label="$t('locationManagement.form.name')" 
            autofocus 
            @keyup.enter="saveLocation"
            :rules="[val => !!val || $t('locationManagement.form.required')]"
          >
            <template v-slot:prepend>
              <q-icon name="place" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="$t('general.cancel')" flat v-close-popup />
          <q-btn 
            :label="$t('general.save')" 
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
import { ref, onMounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '../../api';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const { t } = useI18n();
const locations = ref([]);
const loading = ref(false);
const showAddDialog = ref(false);
const isEditing = ref(false);
const locationForm = reactive({ id: null, name: '' });

const columns = computed(() => [
  { name: 'name', label: t('locationManagement.columns.name'), field: 'name', sortable: true, align: 'left' },
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
    if (isEditing.value) {
      await api.patch(`/locations/${locationForm.id}`, { name: locationForm.name });
      $q.notify({ type: 'positive', message: t('locationManagement.notifications.updateSuccess'), icon: 'check' });
    } else {
      await api.post('/locations', { name: locationForm.name });
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
  isEditing.value = false;
};

onMounted(fetchLocations);
</script>

<style scoped>
.locations-page {
  min-height: 100vh;
}

.hero-header-wrapper {
  /* Default styles if needed */
}

@media (max-width: 768px) {
  .hero-header-wrapper {
    display: none;
  }
}
</style>
