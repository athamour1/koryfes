<template>
  <q-page class="badges-page">
    <!-- Hero Header -->
    <div class="q-pa-md">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1200px; margin: 0 auto;">
        <div class="text-center" style="max-width: 800px; margin: 0 auto;">
          <q-icon name="military_tech" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold q-mb-sm">{{ $t('adminBadges.title') }}</div>
          <div class="text-body1" style="opacity: 0.9;">{{ $t('adminBadges.subtitle') }}</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="q-pa-lg" style="max-width: 1200px; margin: 0 auto;">

      <q-card flat bordered>
        <q-table
      :title="$t('adminBadges.tableTitle')"
      :rows="badges"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
      :filter="filter"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" :placeholder="$t('adminBadges.searchPlaceholder')">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="add" :label="$t('adminBadges.createButton')" class="q-ml-md" @click="createDialog = true" />
      </template>

      <template v-slot:body-cell-image="props">
        <q-td :props="props">
          <q-avatar size="50px">
            <img v-if="props.row.image" :src="`${config.apiUrl}${props.row.image}`" style="object-fit: cover" />
            <q-icon v-else name="star" size="40px" color="grey-5" />
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense color="primary" icon="edit" @click="openEditDialog(props.row)" />
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
          <q-icon size="2em" :name="filter ? 'search_off' : 'stars'" />
          <span>
            {{ filter ? $t('adminBadges.noData.search') : $t('adminBadges.noData.empty') }}
          </span>
        </div>
      </template>
        </q-table>
      </q-card>
    </div>

    <!-- Create Badge Dialog -->
    <q-dialog v-model="createDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('adminBadges.dialog.createTitle') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="createBadge" class="q-gutter-md">
            <q-input filled v-model="newBadge.name" :label="$t('adminBadges.form.name')" :rules="[val => !!val || $t('adminBadges.form.required')]" />
            <q-input filled v-model="newBadge.description" :label="$t('adminBadges.form.description')" type="textarea" />
            <q-file filled v-model="newBadge.imageFile" :label="$t('adminBadges.form.image')" accept=".jpg, .png, .jpeg">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('general.cancel')" flat v-close-popup />
              <q-btn :label="$t('general.create')" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Edit Badge Dialog -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('adminBadges.dialog.editTitle') }}</div>
        </q-card-section>
        
        <q-separator />
        
        <q-card-section class="q-gutter-md">
          <!-- Badge Image Preview -->
          <div class="text-center q-mb-md">
            <q-avatar size="100px">
              <img v-if="editingBadge?.image" :src="`${config.apiUrl}${editingBadge.image}`" style="object-fit: cover" />
              <q-icon v-else name="star" size="80px" color="grey-5" />
            </q-avatar>
          </div>

          <q-input filled v-model="editingBadge.name" :label="$t('adminBadges.form.name')" :rules="[val => !!val || $t('adminBadges.form.required')]" />
          <q-input filled v-model="editingBadge.description" :label="$t('adminBadges.form.description')" type="textarea" />
          
          <!-- Image Upload -->
          <q-file
            filled
            v-model="uploadImageFile"
            :label="$t('adminBadges.form.updateImage')"
            accept=".jpg, .png, .jpeg"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </q-card-section>
        
        <q-separator />
        
        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn :label="$t('general.cancel')" flat color="grey-8" v-close-popup @click="cancelEdit" />
          <q-btn :label="$t('general.save')" color="primary" unelevated @click="saveEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBadgeStore } from '../../stores/badge';
import { useQuasar } from 'quasar';
import { config } from '../../config';

const badgeStore = useBadgeStore();
const $q = useQuasar();
const { t } = useI18n();

const badges = ref([]);
const editDialog = ref(false);
const createDialog = ref(false);
const editingBadge = ref(null);
const originalBadgeData = ref(null);
const uploadImageFile = ref(null);
const filter = ref('');

const newBadge = ref({
  name: '',
  description: '',
  imageFile: null
});

const columns = computed(() => [
  { name: 'image', label: t('adminBadges.columns.image'), field: 'image', align: 'center' },
  { name: 'name', label: t('adminBadges.columns.name'), field: 'name', align: 'left', sortable: true },
  { name: 'description', label: t('adminBadges.columns.description'), field: 'description', align: 'left', sortable: true },
  { name: 'actions', label: t('adminBadges.columns.actions'), align: 'right' }
]);

onMounted(async () => {
  await loadBadges();
});

const loadBadges = async () => {
  badges.value = await badgeStore.fetchBadges();
};

const openEditDialog = (badge) => {
  editingBadge.value = { ...badge };
  originalBadgeData.value = { ...badge };
  uploadImageFile.value = null;
  editDialog.value = true;
};

const saveEdit = async () => {
  try {
    // Upload image if changed
    if (uploadImageFile.value) {
      const imageSuccess = await badgeStore.uploadBadgeImage(editingBadge.value.id, uploadImageFile.value);
      if (!imageSuccess) {
        $q.notify({ color: 'negative', message: t('adminBadges.notifications.imageError'), icon: 'report_problem' });
        return;
      }
    }

    // Update badge info
    const success = await badgeStore.updateBadge(editingBadge.value.id, {
      name: editingBadge.value.name,
      description: editingBadge.value.description
    });

    if (success) {
      $q.notify({ color: 'positive', message: t('adminBadges.notifications.updateSuccess'), icon: 'check' });
      editDialog.value = false;
      await loadBadges();
    } else {
      $q.notify({ color: 'negative', message: t('adminBadges.notifications.updateError'), icon: 'report_problem' });
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: t('adminBadges.notifications.updateError'), icon: 'report_problem' });
  }
};

const cancelEdit = () => {
  editingBadge.value = null;
  originalBadgeData.value = null;
  uploadImageFile.value = null;
};

const createBadge = async () => {
  const success = await badgeStore.createBadge({
    name: newBadge.value.name,
    description: newBadge.value.description,
    imageFile: newBadge.value.imageFile
  });

  if (success) {
    $q.notify({ color: 'positive', message: t('adminBadges.notifications.createSuccess'), icon: 'check' });
    newBadge.value = { name: '', description: '', imageFile: null };
    createDialog.value = false;
    await loadBadges();
  } else {
    $q.notify({ color: 'negative', message: t('adminBadges.notifications.createError'), icon: 'report_problem' });
  }
};
</script>
