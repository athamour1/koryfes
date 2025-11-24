<template>
  <q-page class="progress-page">
    <!-- Hero Header -->
    <div class="q-pa-md hero-header-wrapper">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1400px; margin: 0 auto;">
        <div class="text-center" style="max-width: 800px; margin: 0 auto;">
          <q-icon name="trending_up" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold q-mb-sm">Individual Progress Management</div>
          <div class="text-body1" style="opacity: 0.9;">Manage peaks, diplomas, and paths for scout progression</div>
        </div>
      </div>
    </div>

    <!-- Tabs Content -->
    <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto;">
      <q-card flat bordered>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="peaks" icon="landscape" label="Peaks" />
          <q-tab name="scoutDiplomas" icon="school" label="Scout Diplomas" />
          <q-tab name="electiveDiplomas" icon="stars" label="Elective Diplomas" />
          <q-tab name="paths" icon="route" label="Paths" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Peaks Tab -->
          <q-tab-panel name="peaks">
            <div class="text-h6 q-mb-md">Progression Peaks</div>
            <q-table
              :rows="progressStore.peaks"
              :columns="peakColumns"
              row-key="id"
              flat
              :pagination="{ rowsPerPage: 10 }"
            >
              <!-- Create button removed - Peaks are fixed entries -->

              <template v-slot:body-cell-image="props">
                <q-td :props="props">
                  <q-avatar size="50px">
                    <img v-if="props.row.image" :src="`${config.apiUrl}${props.row.image}`" style="object-fit: cover" />
                    <q-icon v-else name="landscape" size="40px" color="grey-5" />
                  </q-avatar>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense color="primary" icon="edit" @click="openEditPeakDialog(props.row)" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Scout Diplomas Tab -->
          <q-tab-panel name="scoutDiplomas">
            <div class="text-h6 q-mb-md">Scout Diplomas</div>
            <q-table
              :rows="progressStore.scoutDiplomas"
              :columns="scoutDiplomaColumns"
              row-key="id"
              flat
              :pagination="{ rowsPerPage: 10 }"
            >
              <!-- Create button removed - Scout Diplomas are fixed entries -->

              <template v-slot:body-cell-image="props">
                <q-td :props="props">
                  <q-avatar size="50px">
                    <img v-if="props.row.image" :src="`${config.apiUrl}${props.row.image}`" style="object-fit: cover" />
                    <q-icon v-else name="school" size="40px" color="grey-5" />
                  </q-avatar>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense color="primary" icon="edit" @click="openEditScoutDiplomaDialog(props.row)" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Elective Diplomas Tab -->
          <q-tab-panel name="electiveDiplomas">
            <div class="row items-center q-mb-md">
              <div class="text-h6">Elective Diplomas</div>
              <q-space />
              <q-input 
                outlined 
                dense 
                debounce="300" 
                v-model="electiveDiplomaSearch" 
                placeholder="Search diplomas..."
                style="min-width: 250px"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <q-table
              :rows="filteredElectiveDiplomas"
              :columns="electiveDiplomaColumns"
              row-key="id"
              flat
              :pagination="{ rowsPerPage: 10 }"
            >

              <template v-slot:body-cell-image="props">
                <q-td :props="props">
                  <q-avatar size="50px">
                    <img v-if="props.row.image" :src="`${config.apiUrl}${props.row.image}`" style="object-fit: cover" />
                    <q-icon v-else name="stars" size="40px" color="grey-5" />
                  </q-avatar>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense color="primary" icon="edit" @click="openEditElectiveDiplomaDialog(props.row)" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Paths Tab -->
          <q-tab-panel name="paths">
            <div class="row items-center q-mb-md q-gutter-md">
              <div class="text-h6">Learning Paths</div>
              <q-space />
              <q-input 
                outlined 
                dense 
                debounce="300" 
                v-model="pathSearch" 
                placeholder="Search paths..."
                style="min-width: 250px"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-btn-toggle
                v-model="pathCategoryFilter"
                toggle-color="primary"
                :options="pathCategoryToggleOptions"
                @update:model-value="filterPathsByCategory"
              />
            </div>

            <q-table
              :rows="filteredPaths"
              :columns="pathColumns"
              row-key="id"
              flat
              :pagination="{ rowsPerPage: 10 }"
            >

              <!-- No image column needed for paths -->

              <template v-slot:body-cell-category="props">
                <q-td :props="props">
                  <q-chip :color="getCategoryColor(props.row.category)" text-color="white" dense>
                    {{ formatCategory(props.row.category) }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense color="primary" icon="edit" @click="openEditPathDialog(props.row)" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <!-- Peak Dialog - Image Upload Only -->
    <q-dialog v-model="peakDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Peak Image</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- Name (Read-only) -->
          <q-input filled v-model="peakForm.name" label="Name" readonly />
          
          <!-- Image Upload -->
          <q-file 
            filled 
            v-model="peakForm.imageFile" 
            label="Peak Image" 
            accept=".jpg, .png, .jpeg"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="submitPeak" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Scout Diploma Dialog - Image Upload Only -->
    <q-dialog v-model="scoutDiplomaDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Scout Diploma Image</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- Name (Read-only) -->
          <q-input filled v-model="scoutDiplomaForm.name" label="Name" readonly />
          
          <!-- Image Upload -->
          <q-file 
            filled 
            v-model="scoutDiplomaForm.imageFile" 
            label="Diploma Image" 
            accept=".jpg, .png, .jpeg"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="submitScoutDiploma" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Elective Diploma Dialog -->
    <q-dialog v-model="electiveDiplomaDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editMode ? 'Edit Elective Diploma' : 'Create Elective Diploma' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input filled v-model="electiveDiplomaForm.name" label="Name *" :rules="[val => !!val || 'Name is required']" />
          
          <q-input filled v-model="electiveDiplomaForm.description" label="Description" type="textarea" rows="3" />
          
          <q-file 
            filled 
            v-model="electiveDiplomaForm.imageFile" 
            label="Diploma Image" 
            accept=".jpg, .png, .jpeg"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="submitElectiveDiploma" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Path Dialog -->
    <q-dialog v-model="pathDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editMode ? 'Edit Path' : 'Create Path' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input filled v-model="pathForm.name" label="Name *" :rules="[val => !!val || 'Name is required']" />
          
          <q-select 
            filled 
            v-model="pathForm.category" 
            :options="pathCategoryFormOptions" 
            label="Category *" 
            emit-value 
            map-options
          />
          
          <q-input filled v-model="pathForm.description" label="Description" type="textarea" rows="3" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="submitPath" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProgressStore } from 'src/stores/progress';
import { config } from 'src/config';

const tab = ref('peaks');
const progressStore = useProgressStore();
const pathCategoryFilter = ref('all');
const electiveDiplomaSearch = ref('');
const pathSearch = ref('');


const peakColumns = computed(() => [
  { name: 'image', label: 'Image', field: 'image', align: 'center' },
  { name: 'type', label: 'Type', field: 'type', sortable: true, align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]);

const scoutDiplomaColumns = computed(() => [
  { name: 'image', label: 'Image', field: 'image', align: 'center' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]);

const electiveDiplomaColumns = computed(() => [
  { name: 'image', label: 'Image', field: 'image', align: 'center' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]);

const pathColumns = computed(() => [
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'category', label: 'Category', field: 'category', sortable: true, align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]);

const pathCategoryOptions = [
  { label: 'All', value: 'all' },
  { label: 'Me & My Capabilities', value: 'me_and_my_capabilities' },
  { label: 'Society & Volunteering', value: 'society_and_volunteering' },
  { label: 'Nature', value: 'nature' },
  { label: 'Arts', value: 'arts' }
];

const pathCategoryToggleOptions = [
  { label: 'All', value: 'all' },
  { label: 'Me & Capabilities', value: 'me_and_my_capabilities' },
  { label: 'Society', value: 'society_and_volunteering' },
  { label: 'Nature', value: 'nature' },
  { label: 'Arts', value: 'arts' }
];

const filteredElectiveDiplomas = computed(() => {
  if (!electiveDiplomaSearch.value) return progressStore.electiveDiplomas;
  const search = electiveDiplomaSearch.value.toLowerCase();
  return progressStore.electiveDiplomas.filter(diploma => 
    diploma.name?.toLowerCase().includes(search) || 
    diploma.description?.toLowerCase().includes(search)
  );
});

const filteredPaths = computed(() => {
  let paths = progressStore.paths;
  
  // Filter by search
  if (pathSearch.value) {
    const search = pathSearch.value.toLowerCase();
    paths = paths.filter(path => 
      path.name?.toLowerCase().includes(search) || 
      path.description?.toLowerCase().includes(search)
    );
  }
  
  return paths;
});

const filterPathsByCategory = () => {
  const category = pathCategoryFilter.value === 'all' ? null : pathCategoryFilter.value;
  progressStore.fetchPaths(category);
};

const getCategoryColor = (category) => {
  const colors = {
    me_and_my_capabilities: 'blue',
    society_and_volunteering: 'green',
    nature: 'teal',
    arts: 'purple'
  };
  return colors[category] || 'grey';
};

const formatCategory = (category) => {
  const labels = {
    me_and_my_capabilities: 'Me & My Capabilities',
    society_and_volunteering: 'Society & Volunteering',
    nature: 'Nature',
    arts: 'Arts'
  };
  return labels[category] || category;
};

// Dialog state
const peakDialog = ref(false);
const scoutDiplomaDialog = ref(false);
const electiveDiplomaDialog = ref(false);
const pathDialog = ref(false);
const editMode = ref(false);

// Form data
const peakForm = ref({ id: null, name: '', type: 'promise', description: '', order: 1, imageFile: null });
const scoutDiplomaForm = ref({ id: null, name: '', level: 1, description: '', imageFile: null });
const electiveDiplomaForm = ref({ id: null, name: '', description: '', imageFile: null });
const pathForm = ref({ id: null, name: '', category: 'me_and_my_capabilities', description: '', imageFile: null });

// Peak type options
const peakTypeOptions = [
  { label: 'Promise', value: 'promise' },
  { label: 'Bronze', value: 'bronze' },
  { label: 'Silver', value: 'silver' },
  { label: 'Gold', value: 'gold' }
];

// Scout Diploma level options
const scoutDiplomaLevelOptions = [
  { label: '1st Scout Diploma', value: 1 },
  { label: '2nd Scout Diploma', value: 2 },
  { label: '3rd Scout Diploma', value: 3 }
];

// Path category options for form
const pathCategoryFormOptions = [
  { label: 'Me & My Capabilities', value: 'me_and_my_capabilities' },
  { label: 'Society & Volunteering', value: 'society_and_volunteering' },
  { label: 'Nature', value: 'nature' },
  { label: 'Arts', value: 'arts' }
];

// Dialog functions
const openCreatePeakDialog = () => {
  editMode.value = false;
  peakForm.value = { id: null, name: '', type: 'promise', description: '', order: 1, imageFile: null };
  peakDialog.value = true;
};

const openEditPeakDialog = (peak) => {
  editMode.value = true;
  peakForm.value = { ...peak, imageFile: null };
  peakDialog.value = true;
};

const openCreateScoutDiplomaDialog = () => {
  editMode.value = false;
  scoutDiplomaForm.value = { id: null, name: '', level: 1, description: '', imageFile: null };
  scoutDiplomaDialog.value = true;
};

const openEditScoutDiplomaDialog = (diploma) => {
  editMode.value = true;
  scoutDiplomaForm.value = { ...diploma, imageFile: null };
  scoutDiplomaDialog.value = true;
};

const openCreateElectiveDiplomaDialog = () => {
  editMode.value = false;
  electiveDiplomaForm.value = { id: null, name: '', description: '', imageFile: null };
  electiveDiplomaDialog.value = true;
};

const openEditElectiveDiplomaDialog = (diploma) => {
  editMode.value = true;
  electiveDiplomaForm.value = { ...diploma, imageFile: null };
  electiveDiplomaDialog.value = true;
};

const openCreatePathDialog = () => {
  editMode.value = false;
  pathForm.value = { id: null, name: '', category: 'me_and_my_capabilities', description: '', imageFile: null };
  pathDialog.value = true;
};

const openEditPathDialog = (path) => {
  editMode.value = true;
  pathForm.value = { ...path, imageFile: null };
  pathDialog.value = true;
};

// Submit handlers
const submitPeak = async () => {
  try {
    const formData = new FormData();
    formData.append('name', peakForm.value.name);
    formData.append('type', peakForm.value.type);
    formData.append('description', peakForm.value.description || '');
    formData.append('order', peakForm.value.order);
    if (peakForm.value.imageFile) {
      formData.append('image', peakForm.value.imageFile);
    }

    if (editMode.value) {
      await progressStore.updatePeak(peakForm.value.id, formData);
    } else {
      await progressStore.createPeak(formData);
    }
    peakDialog.value = false;
  } catch (error) {
    console.error('Error submitting peak:', error);
  }
};

const submitScoutDiploma = async () => {
  try {
    const formData = new FormData();
    formData.append('name', scoutDiplomaForm.value.name);
    formData.append('level', scoutDiplomaForm.value.level);
    formData.append('description', scoutDiplomaForm.value.description || '');
    if (scoutDiplomaForm.value.imageFile) {
      formData.append('image', scoutDiplomaForm.value.imageFile);
    }

    if (editMode.value) {
      await progressStore.updateScoutDiploma(scoutDiplomaForm.value.id, formData);
    } else {
      await progressStore.createScoutDiploma(formData);
    }
    scoutDiplomaDialog.value = false;
  } catch (error) {
    console.error('Error submitting scout diploma:', error);
  }
};

const submitElectiveDiploma = async () => {
  try {
    const formData = new FormData();
    formData.append('name', electiveDiplomaForm.value.name);
    formData.append('description', electiveDiplomaForm.value.description || '');
    if (electiveDiplomaForm.value.imageFile) {
      formData.append('image', electiveDiplomaForm.value.imageFile);
    }

    if (editMode.value) {
      await progressStore.updateElectiveDiploma(electiveDiplomaForm.value.id, formData);
    } else {
      await progressStore.createElectiveDiploma(formData);
    }
    electiveDiplomaDialog.value = false;
  } catch (error) {
    console.error('Error submitting elective diploma:', error);
  }
};

const submitPath = async () => {
  try {
    const formData = new FormData();
    formData.append('name', pathForm.value.name);
    formData.append('category', pathForm.value.category);
    formData.append('description', pathForm.value.description || '');
    if (pathForm.value.imageFile) {
      formData.append('image', pathForm.value.imageFile);
    }

    if (editMode.value) {
      await progressStore.updatePath(pathForm.value.id, formData);
    } else {
      await progressStore.createPath(formData);
    }
    pathDialog.value = false;
  } catch (error) {
    console.error('Error submitting path:', error);
  }
};

onMounted(async () => {
  await Promise.all([
    progressStore.fetchPeaks(),
    progressStore.fetchScoutDiplomas(),
    progressStore.fetchElectiveDiplomas(),
    progressStore.fetchPaths()
  ]);
});
</script>

<style scoped>
.gradient-purple {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
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
