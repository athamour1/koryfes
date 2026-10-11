<template>
  <!-- Ίδιο σχήμα με την κάρτα Οδηγού του UserListPage -->
  <q-card flat bordered>
    <q-card-section class="row items-center no-wrap q-gutter-md">
      <q-skeleton type="QAvatar" size="64px" />
      <div class="col">
        <q-skeleton type="text" width="60%" height="22px" />
        <q-skeleton type="text" width="40%" />
        <q-skeleton type="QChip" width="90px" height="24px" class="q-mt-xs" />
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section class="row items-center no-wrap q-gutter-sm">
      <q-skeleton type="rect" width="44px" height="44px" />
      <div class="col">
        <q-skeleton type="text" width="50%" />
        <q-skeleton type="text" width="35%" />
      </div>
    </q-card-section>
  </q-card>
</template>
