<template>
  <q-page class="tf-page units-page">
    <!-- Hero Header -->
    <PageHeader 
      icon="groups"
      :title="$t('adminUnits.title')"
      :subtitle="$t('adminUnits.subtitle')"
    />

    <!-- Content -->
    <div>

      <q-card flat bordered>
        <q-table
      :title="$t('adminUnits.tableTitle')"
      v-model:pagination="pagination"
      :rows="rows"
      :columns="columns"
      :visible-columns="visibleColumns"
      :rows-per-page-options="[10, 20, 50]"
      row-key="id"
      flat
      bordered
      @request="onRequest"
    >
      <template v-if="tableLoading" #body="props">
        <SkeletonTableRow :cols="props.cols" :index="props.rowIndex" />
      </template>

      <template v-slot:top-right>
        <div class="units-toolbar">
        <q-input outlined dense debounce="300" v-model="filter" class="units-toolbar__search" :placeholder="$t('adminUnits.searchPlaceholder')" data-cy="search-input">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <!-- φίλτρο τοπικού: στρογγυλό στο κινητό, με το όνομα του τοπικού σε υπολογιστή -->
        <q-btn
          v-if="locationOptions.length > 1"
          color="primary"
          icon="place"
          no-caps
          :outline="!locationFilter"
          :unelevated="!!locationFilter"
          :round="$q.screen.xs"
          :label="$q.screen.xs ? undefined : (selectedLocation?.name || $t('adminUnits.filterLocation'))"
          :aria-label="$t('adminUnits.filterLocation')"
          data-cy="location-filter-btn"
        >
          <q-menu anchor="bottom right" self="top right" :offset="[0, 6]">
            <q-list class="location-menu scroll">
              <q-item clickable v-close-popup :active="!locationFilter" @click="locationFilter = null">
                <q-item-section>{{ $t('adminUnits.allLocations') }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item
                v-for="loc in locationOptions"
                :key="loc.id"
                clickable
                v-close-popup
                :active="locationFilter === loc.id"
                @click="locationFilter = loc.id"
              >
                <q-item-section>{{ loc.name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <!-- στο κινητό σκέτο στρογγυλό «+» -->
        <q-btn
          color="primary"
          icon="add"
          :round="$q.screen.xs"
          :label="$q.screen.xs ? undefined : $t('adminUnits.createButton')"
          :aria-label="$t('adminUnits.createButton')"
          @click="openCreateDialog"
          data-cy="create-unit-btn"
        />
        </div>
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
            color="info"
            icon="visibility"
            :to="`/units/${props.row.id}`"
            :aria-label="$t('adminUnits.viewUnit')"
            data-cy="view-unit-btn"
          >
            <q-tooltip>{{ $t('adminUnits.viewUnit') }}</q-tooltip>
          </q-btn>
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
      <q-card style="width: 100%; max-width: 500px">
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
                  @click="triggerFileInput"
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

            <q-input outlined v-model="unitForm.name" :label="$t('adminUnits.form.name')" :rules="[val => !!val || $t('adminUnits.form.required')]" data-cy="unit-name-input" />
            <q-input outlined v-model="unitForm.description" :label="$t('adminUnits.form.description')" type="textarea" autogrow />
            
            <!-- Location Selection (Super Admin Only) -->
            <q-select
              v-if="authStore.isSuperAdmin"
              outlined
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
import { useUnitStore } from '@/stores/unit';
import { useAuthStore } from '@/stores/auth';
import { useQuasar } from 'quasar';
import { config } from '@/config';
import { api } from '@/api';
import PageHeader from '@/components/PageHeader.vue';
import SkeletonTableRow from '@/components/skeletons/SkeletonTableRow.vue';
import { useServerTable } from '@/composables/useServerTable';

const unitStore = useUnitStore();
const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();

// η ταξινόμηση γίνεται στον server (όνομα, τοπικό)
const columns = computed(() => [
  { name: 'flag', label: t('adminUnits.columns.flag'), field: 'flag', align: 'center', skeleton: 'avatar' },
  { name: 'name', label: t('adminUnits.columns.name'), field: 'name', sortable: true, align: 'left' },
  { name: 'location', label: t('adminUnits.columns.location'), field: row => row.location?.name || 'N/A', sortable: true, align: 'left' },
  { name: 'members', label: t('adminUnits.columns.members'), field: row => row.memberCount ?? 0, align: 'center' },
  { name: 'actions', label: t('adminUnits.columns.actions'), field: 'actions', align: 'right', skeleton: 'actions' }
]);
// στο κινητό μόνο το όνομα και οι ενέργειες
const visibleColumns = computed(() => ($q.screen.xs
  ? ['name', 'actions']
  : columns.value.map((c) => c.name)));

const filter = ref('');
const unitDialog = ref(false);
const isEditing = ref(false);
const uploadFile = ref(null);
const previewImage = ref(null);
const locations = ref([]);
const fileInput = ref(null);

const unitForm = ref({
  id: null,
  name: '',
  description: '',
  flag: null,
  locationId: null
});

// φίλτρο ανά τοπικό: μόνο ο super admin βλέπει πολλά τοπικά
const locationFilter = ref(null);
const locationOptions = computed(() => [...locations.value].sort((a, b) => a.name.localeCompare(b.name, 'el')));
const selectedLocation = computed(() => locationOptions.value.find((l) => l.id === locationFilter.value) || null);
const loading = computed(() => unitStore.loading);

const { pagination, rows, loading: tableLoading, onRequest, refresh } = useServerTable('/units', {
  sortBy: 'name',
  params: () => ({
    search: filter.value || undefined,
    locationId: locationFilter.value || undefined,
  }),
});

const fetchLocations = async () => {
  try {
    const response = await api.get('/locations');
    locations.value = response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

onMounted(() => {
  refresh();
  if (authStore.isSuperAdmin) {
    fetchLocations();
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
  unitForm.value = { 
    ...unit,
    locationId: unit.location?.id
  };
  previewImage.value = null;
  uploadFile.value = null;
  unitDialog.value = true;
};

const triggerFileInput = () => {
  fileInput.value?.pickFiles();
};

const handleImagePreview = (file) => {
  if (file) {
    previewImage.value = URL.createObjectURL(file);
  }
};

const saveUnit = async () => {
  let result;
  if (isEditing.value) {
    const updatePayload = {
      name: unitForm.value.name,
      description: unitForm.value.description
    };

    if (authStore.isSuperAdmin && unitForm.value.locationId) {
      updatePayload.location = { id: unitForm.value.locationId };
    }

    result = await unitStore.updateUnit(unitForm.value.id, updatePayload);
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
    refresh();
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
      refresh();
    } else {
      $q.notify({ color: 'negative', message: unitStore.error || t('adminUnits.notifications.deleteError'), icon: 'report_problem' });
    }
  });
};
</script>

<style scoped>
/* αναζήτηση, φίλτρο τοπικού και «+» σε μία γραμμή· η αναζήτηση στενεύει */
.units-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.units-toolbar__search {
  flex: 1 1 auto;
  min-width: 0;
}
.units-toolbar > .q-btn {
  flex: 0 0 auto;
}
.location-menu {
  min-width: 220px;
  max-height: 60vh;
}
</style>
