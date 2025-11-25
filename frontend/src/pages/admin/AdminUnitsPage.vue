<template>
  <q-page class="units-page">
    <!-- Hero Header -->
    <PageHeader 
      icon="groups"
      :title="$t('adminUnits.title')"
      :subtitle="$t('adminUnits.subtitle')"
    />

    <!-- Content -->
    <div class="q-pa-md" style="max-width: 1200px; margin: 0 auto;">

      <q-card flat bordered>
        <q-table
      :title="$t('adminUnits.tableTitle')"
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
        <q-input borderless dense debounce="300" v-model="filter" :placeholder="$t('adminUnits.searchPlaceholder')" data-cy="search-input">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="add" :label="$t('adminUnits.createButton')" class="q-ml-md" @click="openCreateDialog" data-cy="create-unit-btn" />
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
          <q-btn flat dense color="primary" icon="edit" @click="openEditDialog(props.row)" data-cy="edit-btn" />
          <q-btn 
            flat 
            dense 
            color="negative" 
            icon="delete" 
            @click="confirmDeleteUnit(props.row)" 
            data-cy="delete-btn"
          />
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
          <q-icon size="2em" :name="filter ? 'search_off' : 'groups'" />
          <span>
            {{ filter ? $t('adminUnits.noData.search') : $t('adminUnits.noData.empty') }}
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
          <div class="text-h6">{{ isEditing ? $t('adminUnits.dialog.editTitle') : $t('adminUnits.dialog.createTitle') }}</div>
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

            <q-input filled v-model="unitForm.name" :label="$t('adminUnits.form.name')" :rules="[val => !!val || $t('adminUnits.form.required')]" data-cy="unit-name-input" />
            <q-input filled v-model="unitForm.description" :label="$t('adminUnits.form.description')" type="textarea" autogrow />
            
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
              :label="$t('adminUnits.form.location')"
              :rules="[val => !!val || $t('adminUnits.form.locationRequired')]"
              data-cy="location-select"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" />
              </template>
            </q-select>

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('general.cancel')" flat v-close-popup />
              <q-btn :label="isEditing ? $t('general.save') : $t('general.create')" type="submit" color="primary" :loading="loading" data-cy="save-unit-btn" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUnitStore } from 'src/stores/unit';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';
import { config } from 'src/config';
import { api } from 'src/api';
import PageHeader from 'src/components/PageHeader.vue';

const unitStore = useUnitStore();
const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();

const columns = computed(() => [
  { name: 'flag', label: t('adminUnits.columns.flag'), field: 'flag', align: 'center' },
  { name: 'name', label: t('adminUnits.columns.name'), field: 'name', sortable: true, align: 'left' },
  { name: 'description', label: t('adminUnits.columns.description'), field: 'description', align: 'left', format: val => val && val.length > 50 ? val.substring(0, 50) + '...' : val },
  { name: 'location', label: t('adminUnits.columns.location'), field: row => row.location?.name || 'N/A', sortable: true, align: 'left' },
  { name: 'members', label: t('adminUnits.columns.members'), field: row => row.users?.length || 0, sortable: true, align: 'center' },
  { name: 'actions', label: t('adminUnits.columns.actions'), field: 'actions', align: 'right' }
]);

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
    
    $q.notify({ color: 'positive', message: isEditing.value ? t('adminUnits.notifications.updateSuccess') : t('adminUnits.notifications.createSuccess'), icon: 'check' });
    unitDialog.value = false;
    await unitStore.fetchUnits();
  } else {
    $q.notify({ color: 'negative', message: unitStore.error || t('adminUnits.notifications.operationFailed'), icon: 'report_problem' });
  }
};

const confirmDeleteUnit = (unit) => {
  $q.dialog({
    title: t('adminUnits.delete.title'),
    message: t('adminUnits.delete.message', { name: unit.name }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const success = await unitStore.deleteUnit(unit.id);
    if (success) {
      $q.notify({ color: 'positive', message: t('adminUnits.notifications.deleteSuccess'), icon: 'check' });
    } else {
      $q.notify({ color: 'negative', message: unitStore.error || t('adminUnits.notifications.deleteError'), icon: 'report_problem' });
    }
  });
};
</script>

<style scoped>
</style>
