<template>
  <q-page class="users-page">
    <!-- Hero Header -->
    <div class="q-pa-md hero-header-wrapper">
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
          <div class="avatar-wrapper">
            <AvatarDisplay :config="props.row.avatarConfig" size="40px" :key="`avatar-${props.row.id}`" />
          </div>
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
    <q-dialog v-model="editDialog" @hide="activeTab = 'bronze'">
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
                  <AvatarDisplay :config="editingUserData.avatarConfig" size="120px" :key="`avatar-edit-${editingUserData.id}`" />
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
                v-model="editingUserData.unit"
                :options="editUnitOptions"
                :label="$t('adminUsers.filters.unit')"
                option-label="name"
                option-value="id"
                dense
                class="q-mb-sm"
                clearable
                @update:model-value="val => { if(val && !editingUserData.unitRole) editingUserData.unitRole = 'member' }"
              />

              <q-select
                v-if="editingUserData.role === 'user' && editingUserData.unit"
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

                    <!-- Guide Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-blue-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="school" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.guide') }} ({{ getGuideDiplomaCount(1) }}/1)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="blue" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="awardGuideDiplomaForPeak('bronze')"
                          outline
                          :disable="getGuideDiplomaCount(1) >= 1"
                        />
                      </div>
                      <div v-if="getGuideDiplomasByLevel(1).length > 0">
                        <q-chip
                          v-for="diploma in getGuideDiplomasByLevel(1)"
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
                        {{ $t('progress.admin.noEarnedGuideDiplomas') }}
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

                    <!-- Guide Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-blue-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="school" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.guide') }} ({{ getGuideDiplomaCount(2) }}/1)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="blue" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="awardGuideDiplomaForPeak('silver')"
                          outline
                          :disable="getGuideDiplomaCount(2) >= 1"
                        />
                      </div>
                      <div v-if="getGuideDiplomasByLevel(2).length > 0">
                        <q-chip
                          v-for="diploma in getGuideDiplomasByLevel(2)"
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
                        {{ $t('progress.admin.noEarnedGuideDiplomas') }}
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

                    <!-- Guide Diplomas Section -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2 text-blue-9 q-mb-sm flex items-center justify-between">
                        <span>
                          <q-icon name="school" class="q-mr-xs" />
                          {{ $t('progress.admin.diplomas.guide') }} ({{ getGuideDiplomaCount(3) }}/1)
                        </span>
                        <q-btn 
                          size="sm" 
                          color="blue" 
                          icon="add" 
                          :label="$t('general.award')" 
                          @click="awardGuideDiplomaForPeak('gold')"
                          outline
                          :disable="getGuideDiplomaCount(3) >= 1"
                        />
                      </div>
                      <div v-if="getGuideDiplomasByLevel(3).length > 0">
                        <q-chip
                          v-for="diploma in getGuideDiplomasByLevel(3)"
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
                        {{ $t('progress.admin.noEarnedGuideDiplomas') }}
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
                  </q-tab-panel>
                </q-tab-panels>
              </div>
            </div>
          </div>
        </q-card-section>
        <!-- Action Buttons -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="$t('general.cancel')" color="grey-7" v-close-popup />
          <q-btn unelevated :label="$t('general.save')" color="primary" @click="saveUserChanges" icon="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Award Peak Dialog -->
    <q-dialog v-model="awardPeakDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('progress.admin.awardPeakTitle') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2 q-mb-md">
            {{ $t('progress.admin.awardPeakConfirm', { name: 'Promise' }) }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('general.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('general.award')" color="primary" @click="awardPeak" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Award Elective Diploma Dialog -->
    <q-dialog v-model="awardElectiveDiplomaDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('progress.admin.awardElectiveDiplomaTitle') }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedElectiveDiploma"
            :options="availableElectiveDiplomas"
            option-label="name"
            option-value="id"
            :label="$t('progress.admin.selectDiploma')"
            filled
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('general.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('general.award')" color="primary" @click="awardElectiveDiploma" :disable="!selectedElectiveDiploma" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Award Guide Diploma Dialog -->
    <q-dialog v-model="awardGuideDiplomaDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('progress.admin.awardGuideDiplomaTitle') || 'Award Guide Diploma' }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedGuideDiploma"
            :options="availableGuideDiplomas"
            option-label="name"
            option-value="id"
            :label="$t('progress.admin.selectDiploma') || 'Select Diploma'"
            filled
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('general.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('general.award')" color="primary" @click="awardGuideDiploma" :disable="!selectedGuideDiploma" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Award Path Dialog -->
    <q-dialog v-model="awardPathDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('progress.admin.awardPathTitle') }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedPath"
            :options="availablePaths"
            option-label="name"
            option-value="id"
            :label="$t('progress.admin.selectPath')"
            filled
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('general.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('general.award')" color="primary" @click="awardPath" :disable="!selectedPath" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from 'src/stores/user';
import { useAuthStore } from 'src/stores/auth';
import { useUnitStore } from 'src/stores/unit';
import { api } from 'src/api';
import { useQuasar } from 'quasar';
import { config } from 'src/config';
import AvatarDisplay from 'src/components/AvatarDisplay.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const unitStore = useUnitStore();
const $q = useQuasar();
const { t } = useI18n();

const columns = computed(() => [
  { name: 'profileImage', label: '', field: 'profileImage', align: 'center', style: 'width: 50px' },
  { name: 'username', label: t('adminUsers.columns.username'), field: 'username', sortable: true, align: 'left' },
  { name: 'role', label: t('adminUsers.columns.role'), field: 'role', sortable: true, align: 'center' },
  { name: 'location', label: t('adminUsers.columns.location'), field: row => row.location?.name || '-', sortable: true, align: 'left' },
  { name: 'unit', label: t('adminUsers.columns.unit'), field: row => row.unit?.name || '-', sortable: true, align: 'left' },
  { name: 'unitRole', label: t('adminUsers.columns.unitRole'), field: 'unitRole', sortable: true, align: 'center' },
  { name: 'actions', label: t('adminUsers.columns.actions'), field: 'actions', align: 'right' }
]);

const filter = ref('');
const roleFilter = ref(null);
const locationFilter = ref(null);
const unitFilter = ref(null);
const unitRoleFilter = ref(null);

const createDialog = ref(false);
const editDialog = ref(false);
const newUser = ref({ username: '', password: '', role: 'user', locationName: '', unitId: null, unitRole: null });
const editingUserData = ref({});
const uploadImageFile = ref(null);
const locationOptions = ref([]);

// Progress related state
const userProgress = ref(null);
const activeTab = ref('bronze');
const awardPeakDialog = ref(false);
const awardElectiveDiplomaDialog = ref(false);
const awardGuideDiplomaDialog = ref(false);
const awardPathDialog = ref(false);
const selectedElectiveDiploma = ref(null);
const selectedGuideDiploma = ref(null);
const selectedPath = ref(null);
const allElectiveDiplomas = ref([]);
const allGuideDiplomas = ref([]);
const allPaths = ref([]);

const roleFilterOptions = [
  { label: t('adminUsers.roles.all'), value: null },
  { label: t('adminUsers.roles.superAdmin'), value: 'super_admin' },
  { label: t('adminUsers.roles.admin'), value: 'admin' },
  { label: t('adminUsers.roles.user'), value: 'user' }
];

const availableRoleOptions = computed(() => {
  const options = [
    { label: t('adminUsers.roles.user'), value: 'user' },
    { label: t('adminUsers.roles.admin'), value: 'admin' }
  ];
  if (authStore.isSuperAdmin) {
    options.push({ label: t('adminUsers.roles.superAdmin'), value: 'super_admin' });
  }
  return options;
});

const unitRoleFilterOptions = [
  { label: t('adminUsers.roles.all'), value: null },
  { label: t('adminUsers.roles.leader'), value: 'leader' },
  { label: t('adminUsers.roles.deputyLeader'), value: 'deputy_leader' },
  { label: t('adminUsers.roles.member'), value: 'member' }
];

const unitRoleOptions = [
  { label: t('adminUsers.roles.leader'), value: 'leader' },
  { label: t('adminUsers.roles.deputyLeader'), value: 'deputy_leader' },
  { label: t('adminUsers.roles.member'), value: 'member' }
];

const unitOptions = computed(() => {
  return unitStore.units.map(u => ({ id: u.id, name: u.name }));
});

// Filter units for create/edit based on location
const createUnitOptions = computed(() => {
  if (!newUser.value.locationName && !authStore.user?.location?.name) return [];
  const locName = newUser.value.locationName || authStore.user?.location?.name;
  return unitStore.units.filter(u => u.location?.name === locName).map(u => ({ id: u.id, name: u.name }));
});

const editUnitOptions = computed(() => {
  if (!editingUserData.value.locationName) return [];
  return unitStore.units.filter(u => u.location?.name === editingUserData.value.locationName).map(u => ({ id: u.id, name: u.name }));
});

const filteredUsers = computed(() => {
  let users = userStore.users;

  if (roleFilter.value) {
    users = users.filter(u => u.role === roleFilter.value);
  }

  if (locationFilter.value) {
    users = users.filter(u => u.location?.name === locationFilter.value);
  }

  if (unitFilter.value) {
    users = users.filter(u => u.unit?.id === unitFilter.value);
  }

  if (unitRoleFilter.value) {
    users = users.filter(u => u.unitRole === unitRoleFilter.value);
  }

  return users;
});

const fetchLocations = async () => {
  try {
    const response = await api.get('/locations');
    locationOptions.value = response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

const fetchProgressData = async () => {
  try {
    const [electiveDiplomasRes, guideDiplomasRes, pathsRes] = await Promise.all([
      api.get('/elective-diplomas'),
      api.get('/guide-diplomas'),
      api.get('/paths')
    ]);
    allElectiveDiplomas.value = electiveDiplomasRes.data;
    allGuideDiplomas.value = guideDiplomasRes.data;
    allPaths.value = pathsRes.data;
  } catch (error) {
    console.error('Error fetching progress metadata:', error);
  }
};

const fetchUserProgress = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/progress`);
    userProgress.value = response.data;
    
    // Set active tab based on current peak
    if (userProgress.value?.currentPeak) {
      const peakName = userProgress.value.currentPeak.name.toLowerCase();
      if (peakName === 'promise') activeTab.value = 'bronze';
      else if (peakName === 'bronze') activeTab.value = 'silver';
      else if (peakName === 'silver') activeTab.value = 'gold';
      else if (peakName === 'gold') activeTab.value = 'extra';
    }
  } catch (error) {
    console.error('Error fetching user progress:', error);
    userProgress.value = null;
  }
};

onMounted(async () => {
  await userStore.fetchUsers();
  await unitStore.fetchUnits();
  await fetchLocations();
  await fetchProgressData();
});

const openCreateDialog = () => {
  newUser.value = { username: '', password: '', role: 'user', locationName: '', unitId: null, unitRole: null };
  createDialog.value = true;
};

const openEditDialog = async (user) => {
  editingUserData.value = { 
    ...user, 
    locationName: user.location?.name,
    unit: user.unit ? { id: user.unit.id, name: user.unit.name } : null
  };
  uploadImageFile.value = null;
  
  if (user.role === 'user') {
    await fetchUserProgress(user.id);
  }
  
  editDialog.value = true;
};

const createUser = async () => {
  const payload = { ...newUser.value };
  
  // Handle location logic
  if (!authStore.isSuperAdmin) {
    payload.locationName = authStore.user?.location?.name;
  }
  
  // Clean up unit data if not a user
  if (payload.role !== 'user') {
    delete payload.unitId;
    delete payload.unitRole;
  }

  const success = await userStore.createUser(payload);
  if (success) {
    $q.notify({ color: 'positive', message: t('adminUsers.notifications.createSuccess'), icon: 'check' });
    createDialog.value = false;
    await userStore.fetchUsers();
  } else {
    $q.notify({ color: 'negative', message: userStore.error || t('adminUsers.notifications.createError'), icon: 'report_problem' });
  }
};

const handleImageUpdate = async (file) => {
  if (file) {
    const success = await userStore.uploadProfileImage(editingUserData.value.id, file);
    if (success) {
      $q.notify({ color: 'positive', message: t('adminUsers.notifications.imageUpdateSuccess'), icon: 'check' });
      // Refresh user data
      await userStore.fetchUsers();
      const updatedUser = userStore.users.find(u => u.id === editingUserData.value.id);
      if (updatedUser) {
        editingUserData.value.profileImage = updatedUser.profileImage;
      }
    } else {
      $q.notify({ color: 'negative', message: t('adminUsers.notifications.imageUpdateError'), icon: 'report_problem' });
    }
  }
};

const saveUserChanges = async () => {
  try {
    const updateData = {
      username: editingUserData.value.username,
      locationName: editingUserData.value.locationName
    };

    // Only add unit fields for regular users, not for admins
    if (editingUserData.value.role === 'user') {
      updateData.unit = editingUserData.value.unit ? { id: editingUserData.value.unit.id } : null;
      updateData.unitRole = editingUserData.value.unitRole;
    }

    const success = await userStore.updateUser(editingUserData.value.id, updateData);
    if (success) {
      $q.notify({ color: 'positive', message: t('adminUsers.notifications.updateSuccess') || 'User updated successfully', icon: 'check' });
      editDialog.value = false;
      await userStore.fetchUsers();
    } else {
      $q.notify({ color: 'negative', message: userStore.error || t('adminUsers.notifications.updateError') || 'Error updating user', icon: 'report_problem' });
    }
  } catch (error) {
    console.error('Error saving user changes:', error);
    $q.notify({ color: 'negative', message: t('adminUsers.notifications.updateError') || 'Error updating user', icon: 'report_problem' });
  }
};


const confirmDeleteUser = (user) => {
  $q.dialog({
    title: t('adminUsers.delete.title'),
    message: t('adminUsers.delete.message', { username: user.username }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const success = await userStore.deleteUser(user.id);
    if (success) {
      $q.notify({ color: 'positive', message: t('adminUsers.notifications.deleteSuccess'), icon: 'check' });
    } else {
      $q.notify({ color: 'negative', message: userStore.error || t('adminUsers.notifications.deleteError'), icon: 'report_problem' });
    }
  });
};

const getRoleColor = (role) => {
  switch (role) {
    case 'super_admin': return 'purple';
    case 'admin': return 'orange';
    case 'user': return 'green';
    default: return 'grey';
  }
};

const getUnitRoleColor = (role) => {
  switch (role) {
    case 'leader': return 'deep-orange';
    case 'deputy_leader': return 'orange';
    case 'member': return 'blue';
    default: return 'grey';
  }
};

const formatUnitRole = (role) => {
  if (!role) return '-';
  switch(role) {
    case 'leader': return t('adminUsers.roles.leader');
    case 'deputy_leader': return t('adminUsers.roles.deputyLeader');
    case 'member': return t('adminUsers.roles.member');
    default: return role;
  }
};

// --- Progress Management Logic ---

// Tabs unlock progressively and stay unlocked (cumulative)
// Promise peak → Bronze tab unlocked
// Bronze peak awarded → Bronze + Silver tabs unlocked
// Silver peak awarded → Bronze + Silver + Gold tabs unlocked
// Gold peak awarded → All tabs unlocked (including Extra)
const isBronzeUnlocked = computed(() => {
  const peakType = userProgress.value?.currentPeak?.type?.toLowerCase();
  return ['promise', 'bronze', 'silver', 'gold'].includes(peakType);
});

const isSilverUnlocked = computed(() => {
  const peakType = userProgress.value?.currentPeak?.type?.toLowerCase();
  return ['bronze', 'silver', 'gold'].includes(peakType);
});

const isGoldUnlocked = computed(() => {
  const peakType = userProgress.value?.currentPeak?.type?.toLowerCase();
  return ['silver', 'gold'].includes(peakType);
});

const getElectivesForPeak = (peakLevel) => {
  // Each peak level gets a certain number of elective diplomas
  // Bronze: first 1, Silver: next 1, Gold: next 2, Extra: remaining
  const allElectives = userProgress.value?.electiveDiplomas || [];
  
  if (peakLevel === 'bronze') {
    return allElectives.slice(0, 1); // First elective diploma
  } else if (peakLevel === 'silver') {
    return allElectives.slice(1, 2); // Second elective diploma
  } else if (peakLevel === 'gold') {
    return allElectives.slice(2, 4); // Third and fourth elective diplomas
  } else if (peakLevel === 'extra') {
    return allElectives.slice(4); // Any beyond the first 4
  }
  return [];
};

const getGuideDiplomasByLevel = (level) => {
  // Guide diplomas have a 'level' field (1, 2, or 3)
  const allGuideDiplomas = userProgress.value?.guideDiplomas || [];
  return allGuideDiplomas.filter(d => d.level === level);
};

const getGuideDiplomaCount = (level) => {
  return getGuideDiplomasByLevel(level).length;
};

const getPathsForPeak = (peakLevel) => {
  // Each peak level gets 4 paths
  // Bronze: first 4, Silver: next 4, Gold: next 4, Extra: N/A
  const allPaths = userProgress.value?.completedPaths || [];
  
  if (peakLevel === 'bronze') {
    return allPaths.slice(0, 4); // First 4 paths
  } else if (peakLevel === 'silver') {
    return allPaths.slice(4, 8); // Paths 5-8
  } else if (peakLevel === 'gold') {
    return allPaths.slice(8, 12); // Paths 9-12
  }
  return [];
};

// Dialog Openers
const openAwardPeakDialog = () => {
  awardPeakDialog.value = true;
};

const openAwardElectiveDiplomaDialog = () => {
  selectedElectiveDiploma.value = null;
  awardElectiveDiplomaDialog.value = true;
};

const openAwardGuideDiplomaDialog = (level) => {
  selectedGuideDiploma.value = null;
  awardGuideDiplomaDialog.value = true;
};

const openAwardPathDialog = () => {
  selectedPath.value = null;
  awardPathDialog.value = true;
};

// Computed options for dialogs
const availableElectiveDiplomas = computed(() => {
  const earnedIds = userProgress.value?.electiveDiplomas?.map(d => d.id) || [];
  return allElectiveDiplomas.value.filter(d => !earnedIds.includes(d.id));
});

const availableGuideDiplomas = computed(() => {
  const earnedIds = userProgress.value?.guideDiplomas?.map(d => d.id) || [];
  return allGuideDiplomas.value.filter(d => !earnedIds.includes(d.id));
});

const availablePaths = computed(() => {
  const earnedIds = userProgress.value?.completedPaths?.map(p => p.id) || [];
  return allPaths.value.filter(p => !earnedIds.includes(p.id));
});

// Actions
const awardPeak = async () => {
  try {
    // Award Promise Peak (ID 1 - the starting peak)
    // The Promise peak always has ID 1 in the database
    await api.post(`/users/${editingUserData.value.id}/progress/peak`, { peakId: 1 });
    $q.notify({ color: 'positive', message: t('progress.admin.notifications.peakAwarded'), icon: 'check' });
    awardPeakDialog.value = false;
    await fetchUserProgress(editingUserData.value.id);
  } catch (error) {
    console.error('Error awarding peak:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || t('progress.admin.notifications.error'), icon: 'report_problem' });
  }
};

const awardElectiveDiploma = async () => {
  if (!selectedElectiveDiploma.value) return;
  try {
    await api.post(`/users/${editingUserData.value.id}/progress/diploma`, { diplomaId: selectedElectiveDiploma.value });
    $q.notify({ color: 'positive', message: t('progress.admin.notifications.diplomaAwarded'), icon: 'check' });
    awardElectiveDiplomaDialog.value = false;
    await fetchUserProgress(editingUserData.value.id);
  } catch (error) {
    $q.notify({ color: 'negative', message: t('progress.admin.notifications.error'), icon: 'report_problem' });
  }
};

const awardPath = async () => {
  if (!selectedPath.value) return;
  try {
    await api.post(`/users/${editingUserData.value.id}/progress/path`, { pathId: selectedPath.value });
    $q.notify({ color: 'positive', message: t('progress.admin.notifications.pathAwarded'), icon: 'check' });
    awardPathDialog.value = false;
    await fetchUserProgress(editingUserData.value.id);
  } catch (error) {
    $q.notify({ color: 'negative', message: t('progress.admin.notifications.error'), icon: 'report_problem' });
  }
};

const awardGuideDiplomaForPeak = async (peakLevel) => {
  openAwardGuideDiplomaDialog();
};

const awardGuideDiploma = async () => {
  if (!selectedGuideDiploma.value) return;
  try {
    await api.post(`/users/${editingUserData.value.id}/progress/diploma`, { diplomaId: selectedGuideDiploma.value, type: 'guide' });
    $q.notify({ color: 'positive', message: t('progress.admin.notifications.diplomaAwarded'), icon: 'check' });
    awardGuideDiplomaDialog.value = false;
    await fetchUserProgress(editingUserData.value.id);
  } catch (error) {
    $q.notify({ color: 'negative', message: t('progress.admin.notifications.error'), icon: 'report_problem' });
  }
};

</script>

<style scoped>
@media (max-width: 768px) {
  .hero-header-wrapper {
    display: none;
  }
}
</style>
