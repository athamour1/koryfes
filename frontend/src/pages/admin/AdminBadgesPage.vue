<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Admin: Manage Badges</div>

    <!-- Create New Badge Button -->
    <q-btn color="primary" icon="add" label="Create New Badge" @click="createDialog = true" class="q-mb-md" />

    <!-- Badges Table -->
    <q-table
      :rows="badges"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-image="props">
        <q-td :props="props">
          <q-avatar size="50px" v-if="props.row.image">
            <img :src="`${config.apiUrl}${props.row.image}`" style="object-fit: cover" />
          </q-avatar>
          <q-icon v-else name="star" size="50px" color="grey-5" />
        </q-td>
      </template>

      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div v-if="editingBadge === props.row.id">
            <q-input v-model="props.row.name" dense />
          </div>
          <div v-else>{{ props.row.name }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-description="props">
        <q-td :props="props">
          <div v-if="editingBadge === props.row.id">
            <q-input v-model="props.row.description" dense type="textarea" />
          </div>
          <div v-else>{{ props.row.description }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-sm no-wrap">
            <q-btn v-if="editingBadge !== props.row.id" flat dense color="primary" icon="edit" @click="startEdit(props.row.id)" />
            <q-btn v-if="editingBadge === props.row.id" flat dense color="positive" icon="check" @click="saveEdit(props.row)" />
            <q-btn v-if="editingBadge === props.row.id" flat dense color="negative" icon="close" @click="cancelEdit" />
            <q-btn flat dense color="secondary" icon="image" @click="openImageDialog(props.row)" />
          </div>
        </q-td>
      </template>
    </q-table>

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

    <!-- Upload Image Dialog -->
    <q-dialog v-model="imageDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Update Badge Image</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-file
            v-model="uploadImageFile"
            label="Select Image"
            filled
            accept=".jpg, .png, .jpeg"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Upload" @click="uploadImage" v-close-popup />
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
const editingBadge = ref(null);
const originalBadgeData = ref(null);
const imageDialog = ref(false);
const createDialog = ref(false);
const selectedBadge = ref(null);
const uploadImageFile = ref(null);

const newBadge = ref({
  name: '',
  description: '',
  imageFile: null
});

const columns = [
  { name: 'image', label: 'Image', field: 'image', align: 'center' },
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center' }
];

onMounted(async () => {
  await loadBadges();
});

const loadBadges = async () => {
  badges.value = await badgeStore.fetchBadges();
};

const startEdit = (badgeId) => {
  editingBadge.value = badgeId;
  const badge = badges.value.find(b => b.id === badgeId);
  originalBadgeData.value = { ...badge };
};

const saveEdit = async (badge) => {
  try {
    const success = await badgeStore.updateBadge(badge.id, {
      name: badge.name,
      description: badge.description
    });
    if (success) {
      $q.notify({ color: 'positive', message: 'Badge updated successfully', icon: 'check' });
      editingBadge.value = null;
      await loadBadges();
    } else {
      $q.notify({ color: 'negative', message: 'Failed to update badge', icon: 'report_problem' });
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Failed to update badge', icon: 'report_problem' });
  }
};

const cancelEdit = () => {
  if (originalBadgeData.value) {
    const badge = badges.value.find(b => b.id === editingBadge.value);
    Object.assign(badge, originalBadgeData.value);
  }
  editingBadge.value = null;
  originalBadgeData.value = null;
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

const openImageDialog = (badge) => {
  selectedBadge.value = badge;
  uploadImageFile.value = null;
  imageDialog.value = true;
};

const uploadImage = async () => {
  if (uploadImageFile.value && selectedBadge.value) {
    const success = await badgeStore.uploadBadgeImage(selectedBadge.value.id, uploadImageFile.value);
    if (success) {
      $q.notify({ color: 'positive', message: 'Image uploaded successfully', icon: 'check' });
      await loadBadges();
    } else {
      $q.notify({ color: 'negative', message: 'Failed to upload image', icon: 'report_problem' });
    }
  }
};
</script>
