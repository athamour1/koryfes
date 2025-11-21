<template>
  <q-page class="users-page">
    <!-- Hero Header -->
    <div class="q-pa-md">
      <div class="gradient-purple text-white q-pa-lg q-mb-lg" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 1400px; margin: 0 auto;">
        <div class="text-center" style="max-width: 800px; margin: 0 auto;">
          <q-icon name="people" size="48px" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold q-mb-sm">{{ $t('adminUsers.title') }}</div>
          <div class="text-body1" style="opacity: 0.9;">{{ $t('adminUsers.subtitle') }}</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto;">

      <q-card flat bordered>
        <q-table
      :title="$t('adminUsers.tableTitle')"
      :rows="filteredUsers"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
      :filter="filter"
    >
      <template v-slot:top>
        <div class="full-width">
          <div class="row q-col-gutter-sm items-center justify-between">
            <!-- Left side: Filters -->
            <div class="col-12 col-md-auto row q-col-gutter-sm items-center">
              <div class="text-h6 q-mr-md gt-sm">{{ $t('adminUsers.tableTitle') }}</div>
              
              <!-- Search -->
              <div class="col-12 col-sm-auto">
                <q-input outlined dense debounce="300" v-model="filter" :placeholder="$t('adminUsers.searchPlaceholder')" class="search-input">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <!-- Super Admin only filters -->
              <div class="col-6 col-sm-auto" v-if="authStore.isSuperAdmin">
                <q-select
                  v-model="roleFilter"
                  :options="roleFilterOptions"
                  :label="$t('adminUsers.filters.role')"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                />
              </div>
              <div class="col-6 col-sm-auto" v-if="authStore.isSuperAdmin">
                <q-select
                  v-model="locationFilter"
                  :options="locationOptions"
                  option-label="name"
                  option-value="name"
                  emit-value
                  map-options
                  :label="$t('adminUsers.filters.location')"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                />
              </div>

              <!-- Unit filter for all admins -->
              <div class="col-6 col-sm-auto">
                <q-select
                  v-model="unitFilter"
                  :options="unitOptions"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  :label="$t('adminUsers.filters.unit')"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                />
              </div>

              <!-- Unit role filter for all -->
              <div class="col-6 col-sm-auto">
                <q-select
                  v-model="unitRoleFilter"
                  :options="unitRoleFilterOptions"
                  :label="$t('adminUsers.filters.unitRole')"
                  dense
                  outlined
                  clearable
                  options-dense
                  class="filter-select"
                />
              </div>
            </div>

            <!-- Right side: Actions -->
            <div class="col-12 col-md-auto text-right q-mt-sm q-mt-md-none">
              <q-btn color="primary" icon="add" :label="$t('adminUsers.actions.create')" @click="openCreateDialog" class="full-width-mobile" />
            </div>
          </div>
        </div>
      </template>

      <template v-slot:body-cell-profileImage="props">
        <q-td :props="props">
          <q-avatar size="40px">
            <img :src="getAvatarUrl(props.row.username, props.row.profileImage)" style="object-fit: cover" />
          </q-avatar>
        </q-td>
      </template>
      
      <template v-slot:body-cell-role="props">
        <q-td :props="props">
           <q-chip :color="getRoleColor(props.row.role)" text-color="white" dense class="text-weight-bold">
             {{ props.row.role }}
           </q-chip>
        </q-td>
      </template>
      
      <template v-slot:body-cell-location="props">
        <q-td :props="props">
           <q-chip v-if="props.row.location" color="teal" text-color="white" dense outline icon="place">
             {{ props.row.location.name }}
           </q-chip>
           <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-unit="props">
        <q-td :props="props">
           <q-chip v-if="props.row.unit" color="blue-grey" text-color="white" dense outline icon="groups">
             {{ props.row.unit.name }}
           </q-chip>
           <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-unitRole="props">
        <q-td :props="props">
          <q-chip v-if="props.row.unit && props.row.unitRole" :color="getUnitRoleColor(props.row.unitRole)" text-color="white" dense size="sm" class="text-weight-bold">
            {{ formatUnitRole(props.row.unitRole) }}
          </q-chip>
          <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row justify-end no-wrap">
            <q-btn flat dense round color="primary" icon="edit" @click="openEditDialog(props.row)">
              <q-tooltip>{{ $t('adminUsers.actions.edit') }}</q-tooltip>
            </q-btn>
            <q-btn 
              flat 
              dense 
              round
              color="negative" 
              icon="delete" 
              @click="confirmDeleteUser(props.row)" 
              :disable="props.row.id === authStore.user?.id"
            >
              <q-tooltip v-if="props.row.id === authStore.user?.id">{{ $t('adminUsers.actions.cannotDeleteSelf') }}</q-tooltip>
              <q-tooltip v-else>{{ $t('adminUsers.actions.delete') }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
          <q-icon size="2em" :name="filter ? 'search_off' : 'people_outline'" />
          <span>
            {{ filter ? $t('adminUsers.noData.search') : $t('adminUsers.noData.empty') }}
          </span>
        </div>
      </template>
        </q-table>
      </q-card>
    </div>

    <!-- Create User Dialog -->
    <q-dialog v-model="createDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('adminUsers.dialog.createTitle') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="createUser" class="q-gutter-md">
            <q-input filled v-model="newUser.username" :label="$t('adminUsers.form.username')" :rules="[val => !!val || $t('adminUsers.form.required')]" />
            <q-input filled v-model="newUser.password" :label="$t('adminUsers.form.password')" type="password" :rules="[val => !!val || $t('adminUsers.form.required')]" />
            
            <!-- Role Selection (Super Admin only) -->
            <q-select
              filled
              v-model="newUser.role"
              :options="availableRoleOptions"
              :label="$t('adminUsers.filters.role')"
              emit-value
              map-options
              @update:model-value="val => { if(val !== 'user') { newUser.unitId = null; newUser.unitRole = null; } }"
            />
            
            <!-- Location Selection -->
            <q-select
              v-if="authStore.isSuperAdmin"
              filled
              v-model="newUser.locationName"
              :options="locationOptions"
              :label="$t('adminUsers.filters.location')"
              option-label="name"
              option-value="name"
              emit-value
              map-options
              new-value-mode="add-unique"
            />
            <q-input v-else filled :model-value="authStore.user?.location?.name || $t('adminUsers.form.myLocation')" :label="$t('adminUsers.filters.location')" readonly :hint="$t('adminUsers.form.locationLocked')" />

            <!-- Unit Selection -->
            <q-select
              v-if="newUser.role === 'user'"
              filled
              v-model="newUser.unitId"
              :options="createUnitOptions"
              :label="$t('adminUsers.filters.unit')"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              clearable
              @update:model-value="val => { if(val && !newUser.unitRole) newUser.unitRole = 'member' }"
            />

            <!-- Unit Role Selection (only when unit selected) -->
            <q-select
              v-if="newUser.unitId"
              filled
              v-model="newUser.unitRole"
              :options="unitRoleOptions"
              :label="$t('adminUsers.filters.unitRole')"
              emit-value
              map-options
              :hint="$t('adminUsers.form.unitRoleHint')"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('general.cancel')" flat v-close-popup />
              <q-btn :label="$t('general.create')" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Edit User Dialog -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 1000px; border-radius: 20px; overflow: hidden;">
        <!-- Header with Gradient -->
        <q-card-section class="text-white q-pa-lg" style="background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h5 text-weight-bold">{{ $t('adminUsers.dialog.editTitle') }}</div>
              <div class="text-subtitle2 opacity-80">{{ $t('adminUsers.dialog.editSubtitle') }}</div>
            </div>
            <div class="col-auto">
              <q-btn icon="close" flat round dense v-close-popup class="text-white" />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Left Column: Profile Info -->
            <div class="col-12 text-center" :class="editingUserData.role === 'user' ? 'col-md-5' : 'col-md-12'">
              <div class="relative-position inline-block q-mb-md">
                <q-avatar size="120px" class="shadow-3">
                  <img :src="getAvatarUrl(editingUserData.username, editingUserData.profileImage)" style="object-fit: cover" />
                </q-avatar>
                <q-btn
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  class="absolute-bottom-right"
                  style="bottom: 5px; right: 5px;"
                  @click="$refs.fileInput.pickFiles()"
                />
                <q-file
                  ref="fileInput"
                  v-model="uploadImageFile"
                  style="display: none"
                  accept=".jpg, .png, .jpeg"
                  @update:model-value="handleImageUpdate"
                />
              </div>
              
              <div class="text-h6 q-mb-xs">{{ editingUserData.username }}</div>
              <q-chip :color="getRoleColor(editingUserData.role)" text-color="white" size="sm" class="q-mb-md">
                {{ editingUserData.role }}
              </q-chip>

              <q-input filled v-model="editingUserData.username" :label="$t('adminUsers.form.username')" dense class="q-mb-sm" />
              
              <q-select
                v-if="authStore.isSuperAdmin"
                filled
                v-model="editingUserData.locationName"
                :options="locationOptions"
                :label="$t('adminUsers.filters.location')"
                option-label="name"
                option-value="name"
                emit-value
                map-options
                dense
                class="q-mb-sm"
              />

              <q-select
                v-if="editingUserData.role === 'user'"
                filled
                v-model="editingUserData.unitId"
                :options="editUnitOptions"
                :label="$t('adminUsers.filters.unit')"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                dense
                class="q-mb-sm"
                clearable
                @update:model-value="val => { if(val && !editingUserData.unitRole) editingUserData.unitRole = 'member' }"
              />

              <q-select
                v-if="editingUserData.unitId"
                filled
                v-model="editingUserData.unitRole"
                :options="unitRoleOptions"
                :label="$t('adminUsers.filters.unitRole')"
                emit-value
                map-options
                dense
                class="q-mb-sm"
                :hint="$t('adminUsers.form.unitRoleHint')"
              />
            </div>

            <!-- Right Column: Individual Progress -->
            <div class="col-12 col-md-7" v-if="editingUserData.role === 'user'">
              <div class="text-subtitle1 text-weight-bold q-mb-sm flex items-center">
                <q-icon name="trending_up" class="q-mr-sm" color="primary" />
                {{ $t('progress.admin.title') || 'Individual Progress' }}
              </div>

              <!-- Current Progress Summary -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <div class="col">
                      <div class="text-caption text-grey-7">{{ $t('progress.admin.currentPeak') || 'Current Peak' }}</div>
                      <div class="text-h6">{{ userProgress?.currentPeak?.name || $t('progress.admin.noPeak') || 'No Peak' }}</div>
                    </div>
                    <div class="col-auto">
                      <q-avatar size="60px" v-if="userProgress?.currentPeak?.image">
                        <img :src="`${config.apiUrl}${userProgress.currentPeak.image}`" style="object-fit: cover" />
                      </q-avatar>
                      <q-icon v-else name="landscape" size="60px" color="grey-4" />
                    </div>
                  </div>
                  
                  <q-separator class="q-my-sm" />
                  
                  <div class="row q-col-gutter-sm text-center">
                    <div class="col-4">
                      <div class="text-caption text-grey-7">{{ $t('progress.admin.paths.title') || 'Paths' }}</div>
                      <div class="text-h6 text-primary">{{ userProgress?.completedPaths?.length || 0 }}/12</div>
                    </div>
                    <div class="col-4">
                      <div class="text-caption text-grey-7">{{ $t('progress.admin.diplomas.scout') || 'Scout' }}</div>
                      <div class="text-h6 text-primary">{{ userProgress?.scoutDiplomas?.length || 0 }}/3</div>
                    </div>
                    <div class="col-4">
                      <div class="text-caption text-grey-7">{{ $t('progress.admin.diplomas.elective') || 'Elective' }}</div>
                      <div class="text-h6 text-primary">{{ userProgress?.electiveDiplomas?.length || 0 }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Award Promise Peak (ONLY if no peak) -->
              <div v-if="!userProgress?.currentPeak" class="q-mb-md">
                <q-btn 
                  color="primary" 
                  icon="landscape" 
                  :label="$t('progress.admin.awardPromisePeak') || 'Award Promise Peak'" 
                  @click="openAwardPeakDialog"
                  class="full-width"
                  unelevated
                />
                <div class="text-caption text-grey-7 q-mt-sm text-center">
                  {{ $t('progress.admin.promiseInfo') || 'Award the Promise peak to unlock progress tracking' }}
                </div>
              </div>

              <!-- Tab-Based Progress Management (ONLY if user has a peak) -->
              <div v-if="userProgress?.currentPeak">
                <q-tabs
                  v-model="activeTab"
                  dense
                  class="text-grey-7"
                  active-color="primary"
                  indicator-color="primary"
                  align="justify"
                >
                  <q-tab 
                    name="bronze" 
                    :label="$t('progress.admin.bronzeTab')" 
                    :disable="!isBronzeUnlocked"
                    :icon="isBronzeUnlocked ? 'workspace_premium' : 'lock'"
                  />
                  <q-tab 
                    name="silver" 
                    :label="$t('progress.admin.silverTab')" 
                    :disable="!isSilverUnlocked"
                    :icon="isSilverUnlocked ? 'workspace_premium' : 'lock'"
                  />
                  <q-tab 
                    name="gold" 
                    :label="$t('progress.admin.goldTab')" 
                    :disable="!isGoldUnlocked"
                    :icon="isGoldUnlocked ? 'workspace_premium' : 'lock'"
                  />
                  <q-tab 
                    name="extra" 
                    :label="$t('progress.admin.extraTab') || 'Extra'" 
                    :disable="!isGoldUnlocked"
                    :icon="isGoldUnlocked ? 'add_circle' : 'lock'"
                  />
                </q-tabs>

                <q-separator />

                <q-tab-panels v-model="activeTab" animated>
                  <!-- Bronze Peak Tab -->
                  <q-tab-panel name="bronze">
                    <!-- Elective Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-purple-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="stars" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.elective') }} ({{ getElectivesForPeak('bronze').length }}/1)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="purple" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="openAwardElectiveDiplomaDialog"
                          outline
                          :disable="getElectivesForPeak('bronze').length >= 1"
                        />
                      </div>
                      <div v-if="getElectivesForPeak('bronze').length > 0">
                        <q-chip
                          v-for="diploma in getElectivesForPeak('bronze')"
                          :key="diploma.id"
                          color="purple"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ diploma.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedElectiveDiplomas') }}
                      </div>
                    </div>

                    <!-- Scout Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-blue-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="school" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.scout') }} ({{ getScoutDiplomaCount(1) }}/1)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="blue" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="awardScoutDiplomaForPeak('bronze')"
                          outline
                          :disable="getScoutDiplomaCount(1) >= 1"
                        />
                      </div>
                      <div v-if="getScoutDiplomasByLevel(1).length > 0">
                        <q-chip
                          v-for="diploma in getScoutDiplomasByLevel(1)"
                          :key="diploma.id"
                          color="blue"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ diploma.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedScoutDiplomas') }}
                      </div>
                    </div>

                    <!-- Paths Section -->
                    <div>
                      <div class="text-subtitle2 text-teal-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="route" class="q-mr-xs" />
                          {{ $t('progress.admin.paths.title') }} ({{ getPathsForPeak('bronze').length }}/4)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="teal" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="openAwardPathDialog"
                          outline
                          :disable="getPathsForPeak('bronze').length >= 4"
                        />
                      </div>
                      <div v-if="getPathsForPeak('bronze').length > 0">
                        <q-chip
                          v-for="path in getPathsForPeak('bronze')"
                          :key="path.id"
                          color="teal"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ path.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedPaths') }}
                      </div>
                    </div>
                  </q-tab-panel>

                  <!-- Silver Peak Tab -->
                  <q-tab-panel name="silver">
                    <!-- Elective Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-purple-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="stars" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.elective') }} ({{ getElectivesForPeak('silver').length }}/1)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="purple" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="openAwardElectiveDiplomaDialog"
                          outline
                          :disable="getElectivesForPeak('silver').length >= 1"
                        />
                      </div>
                      <div v-if="getElectivesForPeak('silver').length > 0">
                        <q-chip
                          v-for="diploma in getElectivesForPeak('silver')"
                          :key="diploma.id"
                          color="purple"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ diploma.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedElectiveDiplomas') }}
                      </div>
                    </div>

                    <!-- Scout Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-blue-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="school" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.scout') }} ({{ getScoutDiplomaCount(2) }}/1)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="blue" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="awardScoutDiplomaForPeak('silver')"
                          outline
                          :disable="getScoutDiplomaCount(2) >= 1"
                        />
                      </div>
                      <div v-if="getScoutDiplomasByLevel(2).length > 0">
                        <q-chip
                          v-for="diploma in getScoutDiplomasByLevel(2)"
                          :key="diploma.id"
                          color="blue"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ diploma.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedScoutDiplomas') }}
                      </div>
                    </div>

                    <!-- Paths Section -->
                    <div>
                      <div class="text-subtitle2 text-teal-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="route" class="q-mr-xs" />
                          {{ $t('progress.admin.paths.title') }} ({{ getPathsForPeak('silver').length }}/4)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="teal" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="openAwardPathDialog"
                          outline
                          :disable="getPathsForPeak('silver').length >= 4"
                        />
                      </div>
                      <div v-if="getPathsForPeak('silver').length > 0">
                        <q-chip
                          v-for="path in getPathsForPeak('silver')"
                          :key="path.id"
                          color="teal"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ path.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedPaths') }}
                      </div>
                    </div>
                  </q-tab-panel>

                  <!-- Gold Peak Tab -->
                  <q-tab-panel name="gold">
                    <!-- Elective Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-purple-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="stars" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.elective') }} ({{ getElectivesForPeak('gold').length }}/2)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="purple" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="openAwardElectiveDiplomaDialog"
                          outline
                          :disable="getElectivesForPeak('gold').length >= 2"
                        />
                      </div>
                      <div v-if="getElectivesForPeak('gold').length > 0">
                        <q-chip
                          v-for="diploma in getElectivesForPeak('gold')"
                          :key="diploma.id"
                          color="purple"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ diploma.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedElectiveDiplomas') }}
                      </div>
                    </div>

                    <!-- Scout Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-blue-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="school" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.scout') }} ({{ getScoutDiplomaCount(3) }}/1)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="blue" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="awardScoutDiplomaForPeak('gold')"
                          outline
                          :disable="getScoutDiplomaCount(3) >= 1"
                        />
                      </div>
                      <div v-if="getScoutDiplomasByLevel(3).length > 0">
                        <q-chip
                          v-for="diploma in getScoutDiplomasByLevel(3)"
                          :key="diploma.id"
                          color="blue"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ diploma.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedScoutDiplomas') }}
                      </div>
                    </div>

                    <!-- Paths Section -->
                    <div>
                      <div class="text-subtitle2 text-teal-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="route" class="q-mr-xs" />
                          {{ $t('progress.admin.paths.title') }} ({{ getPathsForPeak('gold').length }}/4)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="teal" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="openAwardPathDialog"
                          outline
                          :disable="getPathsForPeak('gold').length >= 4"
                        />
                      </div>
                      <div v-if="getPathsForPeak('gold').length > 0">
                        <q-chip
                          v-for="path in getPathsForPeak('gold')"
                          :key="path.id"
                          color="teal"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ path.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedPaths') }}
                      </div>
                    </div>
                  </q-tab-panel>

                  <!-- Extra Diplomas Tab (Post-Gold) -->
                  <q-tab-panel name="extra">
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-purple-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="stars" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.elective') }} ({{ getElectivesForPeak('extra').length }})
                        </span>
                        <q-btn 
                          size="sm" 
                          color="purple" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="openAwardElectiveDiplomaDialog"
                          outline
                        />
                      </div>
                      <div v-if="getElectivesForPeak('extra').length > 0">
                        <q-chip
                          v-for="diploma in getElectivesForPeak('extra')"
                          :key="diploma.id"
                          color="purple"
                          text-color="white"
                          size="sm"
                          class="q-ma-xs"
                        >
                          {{ diploma.name }}
                        </q-chip>
                      </div>
                      <div v-else class="text-caption text-grey-6">
                        {{ $t('progress.admin.noEarnedElectiveDiplomas') }}
                      </div>
                    </div>
                    
                    <div class="text-caption text-grey-7 q-mt-md">
                      <q-icon name="info" class="q-mr-xs" />
                      {{ $t('progress.admin.extraStageInfo') || 'This stage allows awarding unlimited elective diplomas after completing the Gold peak.' }}
                    </div>
                  </q-tab-panel>
                </q-tab-panels>
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-separator />
        
        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn :label="$t('general.cancel')" flat color="grey-8" v-close-popup @click="cancelEdit" />
          <q-btn :label="$t('general.save')" color="primary" unelevated @click="saveUserEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Award Peak Dialog -->
    <q-dialog v-model="awardPeakDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('progress.admin.awardPeak') || 'Award Promise Peak' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <p>{{ $t('progress.admin.awardPeakConfirm') || 'Award the Promise peak to this user? This will unlock their ability to earn paths and diplomas.' }}</p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat :label="$t('general.cancel')" color="grey" v-close-popup />
          <q-btn flat :label="$t('general.confirm')" color="primary" @click="awardPromisePeak" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Award Path Dialog -->
    <q-dialog v-model="awardPathDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('progress.admin.awardPath') || 'Award Path' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-select
            filled
            v-model="selectedPath"
            :options="availablePaths"
            option-label="name"
            option-value="id"
            :label="$t('progress.admin.selectPath') || 'Select Path'"
            emit-value
            map-options
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ formatCategory(scope.opt.category) }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat :label="$t('general.cancel')" color="grey" v-close-popup />
          <q-btn flat :label="$t('general.award')" color="primary" @click="awardPath" :disable="!selectedPath" />
        </q-card-actions>
      </q-card>
    </q-dialog>



    <!-- Award Elective Diploma Dialog -->
    <q-dialog v-model="awardElectiveDiplomaDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('progress.admin.awardElectiveDiploma') || 'Award Elective Diploma' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-select
            filled
            v-model="selectedElectiveDiploma"
            :options="availableElectiveDiplomas"
            option-label="name"
            option-value="id"
            :label="$t('progress.admin.selectDiploma') || 'Select Diploma'"
            emit-value
            map-options
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat :label="$t('general.cancel')" color="grey" v-close-popup />
          <q-btn flat :label="$t('general.award')" color="primary" @click="awardElectiveDiploma" :disable="!selectedElectiveDiploma" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../stores/user';
import { useProgressStore } from '../../stores/progress';
import { useAuthStore } from '../../stores/auth';
import { useUnitStore } from '../../stores/unit';
import { useQuasar } from 'quasar';
import { config } from '../../config';
import { api } from '../../api';
import { getAvatarUrl } from '../../utils/avatar';
import { date } from 'quasar';

const userStore = useUserStore();
const progressStore = useProgressStore();
const unitStore = useUnitStore();
const authStore = useAuthStore();

const $q = useQuasar();
const { t } = useI18n();

const columns = computed(() => {
  const baseColumns = [
    { name: 'profileImage', label: t('adminUsers.columns.profileImage'), field: 'profileImage', align: 'center' },
    { name: 'username', label: t('adminUsers.columns.username'), field: 'username', sortable: true, align: 'left' },
    { name: 'role', label: t('adminUsers.columns.role'), field: 'role', sortable: true, align: 'center' },
    { name: 'location', label: t('adminUsers.columns.location'), field: row => row.location?.name || 'N/A', sortable: true, align: 'left' },
    { name: 'unit', label: t('adminUsers.columns.unit'), field: row => row.unit?.name || 'N/A', sortable: true, align: 'left' },
    { name: 'unitRole', label: t('adminUsers.columns.unitRole'), field: 'unitRole', sortable: true, align: 'center' },
    { name: 'actions', label: t('adminUsers.columns.actions'), field: 'actions', align: 'right' }
  ];

  // Filter out location column for non-super admins
  if (!authStore.isSuperAdmin) {
    return baseColumns.filter(col => col.name !== 'location');
  }
  return baseColumns;
});

const users = ref([]);
const units = ref([]);
const locationOptions = ref([]); // For dropdown
const createDialog = ref(false);
const editDialog = ref(false);
const editingUserData = ref(null);
const filter = ref('');
const roleFilter = ref(null);
const locationFilter = ref(null);
const unitFilter = ref(null);
const unitRoleFilter = ref(null);

const roleFilterOptions = computed(() => [
  { label: t('adminUsers.roles.superAdmin'), value: 'super_admin' },
  { label: t('adminUsers.roles.admin'), value: 'admin' },
  { label: t('adminUsers.roles.user'), value: 'user' }
]);

const unitRoleFilterOptions = computed(() => [
  { label: t('adminUsers.roles.leader'), value: 'leader' },
  { label: t('adminUsers.roles.deputyLeader'), value: 'deputy_leader' },
  { label: t('adminUsers.roles.member'), value: 'member' }
]);

const originalUserData = ref(null);
const uploadImageFile = ref(null);

// Progress management
const userProgress = ref(null);
const activeTab = ref('bronze'); // Default to bronze tab
const awardPeakDialog = ref(false);
const awardPathDialog = ref(false);

const awardElectiveDiplomaDialog = ref(false);
const selectedPath = ref(null);

const selectedElectiveDiploma = ref(null);

// Tab unlock logic
const isBronzeUnlocked = computed(() => userProgress.value?.currentPeak?.order >= 1);
const isSilverUnlocked = computed(() => userProgress.value?.currentPeak?.order >= 2);
const isGoldUnlocked = computed(() => userProgress.value?.currentPeak?.order >= 3);

// Helper functions for filtering diplomas
const getScoutDiplomasByLevel = (level) => {
  if (!userProgress.value?.scoutDiplomas) return [];
  return userProgress.value.scoutDiplomas.filter(d => d.level === level);
};

const getScoutDiplomaCount = (level) => {
  return getScoutDiplomasByLevel(level).length;
};

const getPathsForPeak = (peak) => {
  const paths = userProgress.value?.completedPaths || [];
  if (peak === 'bronze') return paths.slice(0, 4);
  if (peak === 'silver') return paths.slice(4, 8);
  if (peak === 'gold') return paths.slice(8, 12);
  return [];
};

const getElectivesForPeak = (peak) => {
  const electives = userProgress.value?.electiveDiplomas || [];
  if (peak === 'bronze') return electives.slice(0, 1);
  if (peak === 'silver') return electives.slice(1, 2);
  if (peak === 'gold') return electives.slice(2, 4);
  if (peak === 'extra') return electives.slice(4);
  return [];
};



const newUser = ref({
  username: '',
  password: '',
  locationName: '',
  role: 'user',
  unitId: null,
  unitRole: 'member'
});

const roleOptions = computed(() => [
  { label: t('adminUsers.roles.user'), value: 'user' },
  { label: t('adminUsers.roles.admin'), value: 'admin' },
  { label: t('adminUsers.roles.superAdmin'), value: 'super_admin' }
]);

const availableRoleOptions = computed(() => {
  if (authStore.isSuperAdmin) {
    return roleOptions.value;
  }
  return roleOptions.value.filter(opt => opt.value === 'user');
});

const unitRoleOptions = computed(() => [
  { label: t('adminUsers.roles.member'), value: 'member' },
  { label: t('adminUsers.roles.deputyLeader'), value: 'deputy_leader' },
  { label: t('adminUsers.roles.leader'), value: 'leader' }
]);

const filteredUsers = computed(() => {
  let result = users.value;
  
  // Filter by role (super admin only)
  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value.value);
  }
  
  // Filter by location (super admin only)
  if (locationFilter.value) {
    result = result.filter(user => user.location?.name === locationFilter.value);
  }
  
  // Filter by unit
  if (unitFilter.value) {
    result = result.filter(user => user.unit?.id === unitFilter.value);
  }
  
  // Filter by unit role
  if (unitRoleFilter.value) {
    result = result.filter(user => user.unitRole === unitRoleFilter.value.value);
  }
  
  return result;
});

// Progress management computed properties
const availablePaths = computed(() => {
  const completedPathIds = userProgress.value?.completedPaths?.map(p => p.id) || [];
  return progressStore.paths.filter(p => !completedPathIds.includes(p.id));
});

const availableScoutDiplomas = computed(() => {
  const earnedDiplomaIds = userProgress.value?.scoutDiplomas?.map(d => d.id) || [];
  return progressStore.scoutDiplomas.filter(d => !earnedDiplomaIds.includes(d.id));
});

const availableElectiveDiplomas = computed(() => {
  const earnedDiplomaIds = userProgress.value?.electiveDiplomas?.map(d => d.id) || [];
  return progressStore.electiveDiplomas.filter(d => !earnedDiplomaIds.includes(d.id));
});

const formatCategory = (category) => {
  const labels = {
    me_and_my_capabilities: 'Me & My Capabilities',
    society_and_volunteering: 'Society & Volunteering',
    nature: 'Nature',
    arts: 'Arts'
  };
  return labels[category] || category;
};

const unitOptions = computed(() => units.value);

const createUnitOptions = computed(() => {
  if (authStore.isSuperAdmin) {
    return newUser.value.locationName ? units.value.filter(u => u.location?.name === newUser.value.locationName) : [];
  } else {
    const myLoc = authStore.user?.location?.name;
    return myLoc ? units.value.filter(u => u.location?.name === myLoc) : [];
  }
});

const editUnitOptions = computed(() => {
  if (!editingUserData.value?.locationName) return [];
  return units.value.filter(u => u.location?.name === editingUserData.value.locationName);
});

const loadData = async () => {
  try {
    await userStore.fetchUsers();
    users.value = userStore.users;
    
    // Load progress data
    await Promise.all([
      progressStore.fetchPeaks(),
      progressStore.fetchPaths(),
      progressStore.fetchScoutDiplomas(),
      progressStore.fetchElectiveDiplomas()
    ]);

    await unitStore.fetchUnits();
    units.value = unitStore.units;
    
    if (authStore.isSuperAdmin) {
      const locResponse = await api.get('/locations');
      locationOptions.value = locResponse.data;
    } else {
      locationOptions.value = authStore.user?.location ? [authStore.user.location] : [];
    }
  } catch (error) {
    console.error('Failed to load data', error);
    $q.notify({ color: 'negative', message: t('adminUsers.notifications.loadError'), icon: 'report_problem' });
  }
};

onMounted(() => {
  loadData();
});

const openEditDialog = async (user) => {
  editingUserData.value = JSON.parse(JSON.stringify(user)); // Deep copy
  editingUserData.value.locationName = user.location?.name;
  editingUserData.value.unitId = user.unit?.id;
  editingUserData.value.unitRole = user.unitRole || 'member';
  
  // Fetch user progress
  try {
    const userResponse = await api.get(`/users/${user.id}`);
    userProgress.value = userResponse.data.progress || null;
  } catch (error) {
    console.error('Failed to load user progress:', error);
    userProgress.value = null;
  }
  
  originalUserData.value = JSON.parse(JSON.stringify(user));
  uploadImageFile.value = null;
  editDialog.value = true;
};

const cancelEdit = () => {
  editingUserData.value = null;
  originalUserData.value = null;
  uploadImageFile.value = null;
  userProgress.value = null;
  selectedPath.value = null;
  selectedScoutDiploma.value = null;
  selectedElectiveDiploma.value = null;
};

const confirmDeleteUser = (user) => {
  $q.dialog({
    title: t('adminUsers.delete.title'),
    message: t('adminUsers.delete.message', { username: user.username }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/users/${user.id}`);
      $q.notify({ color: 'positive', message: t('adminUsers.notifications.deleteSuccess'), icon: 'check' });
      await loadData();
    } catch (error) {
      console.error('Failed to delete user', error);
      $q.notify({ color: 'negative', message: t('adminUsers.notifications.deleteError'), icon: 'report_problem' });
    }
  });
};

const saveUserEdit = async () => {
  if (uploadImageFile.value) {
    const imageSuccess = await userStore.uploadUserImage(editingUserData.value.id, uploadImageFile.value);
    if (!imageSuccess) {
      $q.notify({ color: 'negative', message: t('adminUsers.notifications.imageError'), icon: 'report_problem' });
      return;
    }
  }

  const result = await userStore.updateUser(editingUserData.value.id, {
    username: editingUserData.value.username,
    locationName: editingUserData.value.locationName,
    unit: editingUserData.value.unitId ? { id: editingUserData.value.unitId } : null,
    unitRole: editingUserData.value.unitId ? editingUserData.value.unitRole : null
  });

  if (!result) {
    $q.notify({ color: 'negative', message: t('adminUsers.notifications.updateError'), icon: 'report_problem' });
    return;
  }

  // Check for demotion
  if (result.demotedUser) {
    const roleLabel = formatUnitRole(result.demotedUser.role);
    $q.notify({ 
      color: 'info', 
      message: t('adminUsers.notifications.demotion', { username: result.demotedUser.username, role: roleLabel }),
      icon: 'info',
      timeout: 5000
    });
  }

  $q.notify({ color: 'positive', message: t('adminUsers.notifications.updateSuccess'), icon: 'check' });
  editDialog.value = false;
  await loadData();
}

// Progress Management Functions
const openAwardPeakDialog = () => {
  awardPeakDialog.value = true;
};

const openAwardPathDialog = () => {
  awardPathDialog.value = true;
};



const openAwardElectiveDiplomaDialog = () => {
  awardElectiveDiplomaDialog.value = true;
};

const awardPromisePeak = async () => {
  try {
    const promisePeak = progressStore.peaks.find(p => p.order === 1);
    if (!promisePeak) {
      $q.notify({ color: 'negative', message: 'Promise peak not found', icon: 'report_problem' });
      return;
    }
    
    await progressStore.awardPeakToUser(editingUserData.value.id, promisePeak.id);
    $q.notify({ color: 'positive', message: t('progress.admin.peakAwarded') || 'Promise peak awarded successfully!', icon: 'check' });
    
    // Refresh user progress
    const userResponse = await api.get(`/users/${editingUserData.value.id}`);
    userProgress.value = userResponse.data.progress || null;
    
    awardPeakDialog.value = false;
  } catch (error) {
    console.error('Error awarding peak:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Failed to award peak', icon: 'report_problem' });
  }
};

const awardPath = async () => {
  if (!selectedPath.value) return;
  
  try {
    await progressStore.awardPathToUser(editingUserData.value.id, selectedPath.value);
    $q.notify({ color: 'positive', message: t('progress.admin.pathAwarded') || 'Path awarded successfully!', icon: 'check' });
    
    // Refresh user progress
    const userResponse = await api.get(`/users/${editingUserData.value.id}`);
    userProgress.value = userResponse.data.progress || null;
    
    selectedPath.value = null;
    awardPathDialog.value = false;
  } catch (error) {
    console.error('Error awarding path:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Failed to award path', icon: 'report_problem' });
  }
};



const awardScoutDiplomaForPeak = async (peak) => {
  let level = 0;
  if (peak === 'bronze') level = 1;
  else if (peak === 'silver') level = 2;
  else if (peak === 'gold') level = 3;

  // Find available diploma for this level
  const diploma = availableScoutDiplomas.value.find(d => d.level === level);

  if (!diploma) {
    $q.notify({ color: 'warning', message: t('progress.admin.noAvailableDiplomaForLevel', { level }) || `No available diploma found for level ${level}`, icon: 'warning' });
    return;
  }

  try {
    await progressStore.awardDiplomaToUser(editingUserData.value.id, diploma.id, 'scout');
    $q.notify({ color: 'positive', message: t('progress.admin.diplomaAwarded') || 'Scout diploma awarded successfully!', icon: 'check' });

    // Refresh user progress
    const userResponse = await api.get(`/users/${editingUserData.value.id}`);
    userProgress.value = userResponse.data.progress || null;
  } catch (error) {
    console.error('Error awarding scout diploma:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Failed to award diploma', icon: 'report_problem' });
  }
};

const awardElectiveDiploma = async () => {
  if (!selectedElectiveDiploma.value) return;
  
  try {
    await progressStore.awardDiplomaToUser(editingUserData.value.id, selectedElectiveDiploma.value, 'elective');
    $q.notify({ color: 'positive', message: t('progress.admin.diplomaAwarded') || 'Elective diploma awarded successfully!', icon: 'check' });
    
    // Refresh user progress
    const userResponse = await api.get(`/users/${editingUserData.value.id}`);
    userProgress.value = userResponse.data.progress || null;
    
    selectedElectiveDiploma.value = null;
    awardElectiveDiplomaDialog.value = false;
  } catch (error) {
    console.error('Error awarding elective diploma:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Failed to award diploma', icon: 'report_problem' });
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return date.formatDate(dateString, 'MMM D, YYYY');
};

const handleImageUpdate = (file) => {
  if (file) {
    editingUserData.value.profileImage = URL.createObjectURL(file);
  }
};

const getRoleColor = (role) => {
    switch(role) {
        case 'super_admin': return 'negative';
        case 'admin': return 'warning';
        default: return 'primary';
    }
};

const openCreateDialog = () => {
    createDialog.value = true;
};

const createUser = async () => {
  try {
    const result = await userStore.createUser({
      username: newUser.value.username,
      password: newUser.value.password,
      locationName: newUser.value.locationName,
      role: newUser.value.role,
      unit: newUser.value.unitId ? { id: newUser.value.unitId } : null,
      unitRole: newUser.value.unitId ? newUser.value.unitRole : null
    });
    
    if (result) {
      $q.notify({ color: 'positive', message: t('adminUsers.notifications.createSuccess'), icon: 'check' });
      
      // Check for demotion
      if (result.demotedUser) {
        const roleLabel = formatUnitRole(result.demotedUser.role);
        $q.notify({ 
          color: 'info', 
          message: `Note: User "${result.demotedUser.username}" was demoted from ${roleLabel} to Member`,
          icon: 'info',
          timeout: 5000
        });
      }
      
      createDialog.value = false;
      
      newUser.value = {
        username: '',
        password: '',
        locationName: '',
        role: 'user',
        unitId: null,
        unitRole: 'member'
      };
      
      await loadData();
    } else {
      $q.notify({ color: 'negative', message: t('adminUsers.notifications.createError'), icon: 'report_problem' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || t('adminUsers.notifications.createError'), icon: 'report_problem' });
  }
};

const getUnitRoleColor = (unitRole) => {
  switch(unitRole) {
    case 'leader': return 'deep-purple';
    case 'deputy_leader': return 'purple';
    case 'member': return 'grey';
    default: return 'grey';
  }
};

const formatUnitRole = (unitRole) => {
  switch(unitRole) {
    case 'leader': return t('adminUsers.roles.leader');
    case 'deputy_leader': return t('adminUsers.roles.deputyLeader');
    case 'member': return t('adminUsers.roles.member');
    default: return unitRole;
  }
};
</script>


