<template>
  <q-page class="badges-page">
    <!-- Hero Header -->
    <div class="q-pa-md">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1200px; margin: 0 auto;">
        <div class="text-center" style="max-width: 800px; margin: 0 auto;">
          <q-icon name="military_tech" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold q-mb-sm">Badge Management</div>
          <div class="text-body1" style="opacity: 0.9;">Manage scout badges and achievements</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="q-pa-lg" style="max-width: 1200px; margin: 0 auto;">

      <q-card flat bordered>
        <q-table
      title="Badges"
      :rows="badges"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
      :filter="filter"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="add" label="Create New Badge" class="q-ml-md" @click="createDialog = true" />
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
            {{ filter ? 'No badges match your search' : 'No badges created yet' }}
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
          <div class="text-h6">Create New Badge</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="createBadge" class="q-gutter-md">
            <q-input filled v-model="newBadge.name" label="Badge Name" :rules="[val => !!val || 'Required']" />
            <q-input filled v-model="newBadge.description" label="Description" type="textarea" />
            <q-file filled v-model="newBadge.imageFile" label="Badge Image" accept=".jpg, .png, .jpeg">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" flat v-close-popup />
              <q-btn label="Create" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Edit Badge Dialog -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Edit Badge</div>
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

          <q-input filled v-model="editingBadge.name" label="Badge Name" :rules="[val => !!val || 'Required']" />
          <q-input filled v-model="editingBadge.description" label="Description" type="textarea" />
          
          <!-- Image Upload -->
          <q-file
            filled
            v-model="uploadImageFile"
            label="Update Badge Image"
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
          <q-btn label="Cancel" flat color="grey-8" v-close-popup @click="cancelEdit" />
          <q-btn label="Save Changes" color="primary" unelevated @click="saveEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBadgeStore } from '../../stores/badge';
import { useQuasar } from 'quasar';
import { config } from '../../config';

const badgeStore = useBadgeStore();
const $q = useQuasar();

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

const columns = [
  { name: 'image', label: 'Image', field: 'image', align: 'center' },
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'description', label: 'Description', field: 'description', align: 'left', sortable: true },
  { name: 'actions', label: 'Actions', align: 'right' }
];

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
        $q.notify({ color: 'negative', message: 'Failed to upload image', icon: 'report_problem' });
        return;
      }
    }

    // Update badge info
    const success = await badgeStore.updateBadge(editingBadge.value.id, {
      name: editingBadge.value.name,
      description: editingBadge.value.description
    });

    if (success) {
      $q.notify({ color: 'positive', message: 'Badge updated successfully', icon: 'check' });
      editDialog.value = false;
      await loadBadges();
    } else {
      $q.notify({ color: 'negative', message: 'Failed to update badge', icon: 'report_problem' });
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Failed to update badge', icon: 'report_problem' });
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
    $q.notify({ color: 'positive', message: 'Badge created successfully', icon: 'check' });
    newBadge.value = { name: '', description: '', imageFile: null };
    createDialog.value = false;
    await loadBadges();
  } else {
    $q.notify({ color: 'negative', message: 'Failed to create badge', icon: 'report_problem' });
  }
};
</script>
