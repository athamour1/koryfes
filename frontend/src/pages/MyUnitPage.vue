<template>
  <q-page class="q-pa-md admin-page">
    <!-- Hero Section -->
    <div class="page-hero">
      <div class="page-hero-background"></div>
      <div class="page-hero-content">
        <div class="row items-center justify-center">
          <div>
            <h1 class="page-title text-center">
              <q-icon name="groups" />
              {{ $t('myUnit.title') }}
            </h1>
            <div class="page-subtitle">{{ $t('myUnit.subtitle') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner color="primary" size="3em" />
      </div>

      <div v-else-if="!unit" class="row justify-center q-pa-xl">
        <div class="text-h6 text-grey">{{ $t('myUnit.notFound') }}</div>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <!-- Unit Details Card -->
        <div class="col-12 col-md-8">
          <q-card class="modern-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('myUnit.infoTitle') }}</div>
              <q-form @submit="saveUnit" class="q-gutter-md">
                <q-input
                  filled
                  v-model="unitForm.name"
                  :label="$t('myUnit.nameLabel')"
                  readonly
                  :hint="$t('myUnit.nameHint')"
                />

                <q-input
                  filled
                  v-model="unitForm.description"
                  :label="$t('myUnit.descriptionLabel')"
                  type="textarea"
                  :readonly="!isLeader"
                  :rules="[val => !!val || $t('myUnit.descriptionRequired')]"
                />

                <div v-if="isLeader" class="row justify-end">
                  <q-btn
                    :label="$t('general.save')"
                    type="submit"
                    color="primary"
                    :loading="saving"
                    class="gradient-btn"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Flag Card -->
        <div class="col-12 col-md-4">
          <q-card class="modern-card text-center">
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('myUnit.flagTitle') }}</div>
              <div class="relative-position inline-block q-mb-md">
                <q-avatar size="200px" square class="shadow-3" style="border-radius: 12px">
                  <img 
                    v-if="previewImage || unit.flag" 
                    :src="previewImage || getFlagUrl(unit.flag)" 
                    style="object-fit: cover" 
                  />
                  <q-icon v-else name="flag" size="100px" color="grey-4" />
                </q-avatar>
                
                <q-btn
                    v-if="isLeader"
                    round
                    color="primary"
                    icon="edit"
                    class="absolute-bottom-right"
                    style="bottom: -10px; right: -10px"
                    @click="$refs.fileInput.pickFiles()"
                  />
                
                <q-file
                    v-if="isLeader"
                    ref="fileInput"
                    v-model="uploadFile"
                    style="display: none"
                    accept=".jpg, .png, .jpeg"
                    @update:model-value="handleImageUpdate"
                  />
              </div>
              <div class="text-caption text-grey">
                {{ $t('myUnit.flagHint') }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Unit Members Card - Only for Leaders and Deputies -->
        <div v-if="isLeader" class="col-12">
          <q-card class="modern-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="groups" class="q-mr-sm" />
                {{ $t('myUnit.membersTitle') || 'Unit Members' }}
              </div>
              
              <div v-if="loadingMembers" class="row justify-center q-pa-md">
                <q-spinner color="primary" size="2em" />
              </div>

              <div v-else-if="unitMembers.length === 0" class="text-center q-pa-md text-grey">
                {{ $t('myUnit.noMembers') || 'No members in this unit yet' }}
              </div>

              <q-list v-else separator>
                <q-item v-for="member in unitMembers" :key="member.id">
                  <q-item-section avatar>
                    <q-avatar>
                      <img v-if="member.profileImage" :src="getImageUrl(member.profileImage)" />
                      <q-icon v-else name="person" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ member.username }}</q-item-label>
                    <q-item-label caption>
                      <q-chip 
                        v-if="member.progress?.currentPeak" 
                        :color="getPeakColor(member.progress.currentPeak.type)" 
                        text-color="white" 
                        size="sm"
                        dense
                      >
                        <q-icon name="landscape" class="q-mr-xs" size="xs" />
                        {{ member.progress.currentPeak.name }}
                      </q-chip>
                      <span v-else class="text-grey">
                        {{ $t('myUnit.noPeak') || 'No peak assigned yet' }}
                      </span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      color="blue"
                      icon="visibility"
                      :label="$t('myUnit.viewProgress') || 'View Progress'"
                      @click="viewMemberProgress(member)"
                      outline
                      dense
                      no-caps
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useUnitStore } from 'src/stores/unit';
import { api } from 'src/api';
import { useQuasar } from 'quasar';
import { config } from 'src/config';

const { t } = useI18n();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const unitStore = useUnitStore();

const isLeader = computed(() => {
  const role = authStore.user?.unitRole;
  return role === 'leader' || role === 'deputy_leader';
});


const loading = ref(true);
const saving = ref(false);
const loadingMembers = ref(false);
const unit = ref(null);
const uploadFile = ref(null);
const previewImage = ref(null);
const unitMembers = ref([]);

const unitForm = ref({
  name: '',
  description: ''
});

const getFlagUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${config.apiUrl}${path}`;
};

const getImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${config.apiUrl}${path}`;
};

const getPeakColor = (type) => {
  const colors = {
    promise: 'green',
    bronze: 'deep-orange',
    silver: 'grey',
    gold: 'amber'
  };
  return colors[type] || 'primary';
};

const handleImageUpdate = (file) => {
  if (file) {
    previewImage.value = URL.createObjectURL(file);
  }
};

const loadUnit = async () => {
  loading.value = true;
  try {
    const userUnitId = authStore.user?.unit?.id;
    if (userUnitId) {
      // Fetch unit details directly
      const response = await api.get(`/units/${userUnitId}`);
      unit.value = response.data;
      
      unitForm.value = {
        name: unit.value.name,
        description: unit.value.description
      };
    }
  } catch (error) {
    console.error('Failed to load unit', error);
    $q.notify({
      color: 'negative',
      message: t('myUnit.loadError'),
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
};

const loadUnitMembers = async () => {
  if (!unit.value) return;
  
  loadingMembers.value = true;
  try {
    // Fetch all users
    const usersResponse = await api.get('/users');
    const allUsers = usersResponse.data;
    
    // Filter users by unit ID
    const members = allUsers.filter(u => u.unit?.id === unit.value.id);
    
    // Fetch progress for each member
    const membersWithProgress = await Promise.all(
      members.map(async (member) => {
        try {
          const progressResponse = await api.get(`/users/${member.id}/progress`);
          return {
            ...member,
            progress: progressResponse.data
          };
        } catch (error) {
          console.error(`Failed to load progress for user ${member.id}`, error);
          return {
            ...member,
            progress: null
          };
        }
      })
    );
    
    unitMembers.value = membersWithProgress;
  } catch (error) {
    console.error('Failed to load unit members', error);
    $q.notify({
      color: 'negative',
      message: t('myUnit.loadMembersError') || 'Failed to load unit members',
      icon: 'report_problem'
    });
  } finally {
    loadingMembers.value = false;
  }
};

const saveUnit = async () => {
  saving.value = true;
  try {
    const payload = {
      description: unitForm.value.description
    };
    // If a new flag file is selected, upload it via separate endpoint
    if (uploadFile.value) {
      const formData = new FormData();
      formData.append('file', uploadFile.value);
      await api.post(`/units/${unit.value.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    await api.patch(`/units/${unit.value.id}`, payload);
    $q.notify({
      color: 'positive',
      message: t('myUnit.updateSuccess'),
      icon: 'check'
    });
    await loadUnit();
    uploadFile.value = null;
    previewImage.value = null;
  } catch (error) {
    console.error('Failed to update unit', error);
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('myUnit.updateError'),
      icon: 'report_problem'
    });
  } finally {
    saving.value = false;
  }
};



const viewMemberProgress = (member) => {
  // Navigate to the user's profile page
  router.push(`/user/${member.id}`);
};

onMounted(async () => {
  await loadUnit();
  // Only load members if user is a leader or deputy
  if (isLeader.value) {
    await loadUnitMembers();
  }
});
</script>

<style scoped>
/* Reuse global admin styles */
@import '../css/admin-pages.css';
.page-hero {
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .page-hero {
    display: none;
  }
}
</style>
