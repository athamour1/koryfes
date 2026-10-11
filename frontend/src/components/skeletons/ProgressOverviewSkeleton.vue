<template>
  <!-- Ίδιο σχήμα με το ProgressOverview: κορυφές, τρέχουσα κορυφή, πτυχία, μονοπάτια -->
  <div>
    <div class="row items-center q-gutter-xs q-mb-md">
      <q-skeleton v-for="n in 5" :key="n" type="QChip" width="88px" height="24px" />
    </div>

    <div class="hero q-mb-lg">
      <div class="hero__badge">
        <q-skeleton type="circle" size="136px" />
        <q-skeleton type="text" width="100px" class="q-mt-sm" />
      </div>
      <div class="hero__next">
        <q-skeleton type="text" width="40%" height="24px" class="q-mb-sm" />
        <div v-for="n in 3" :key="n" class="q-mb-md">
          <q-skeleton type="text" width="65%" />
          <q-skeleton type="rect" height="6px" />
        </div>
      </div>
    </div>

    <div v-for="group in 2" :key="group" class="q-mb-lg">
      <q-skeleton type="text" width="160px" height="22px" class="q-mb-sm" />
      <div class="badges">
        <q-skeleton v-for="n in 4" :key="n" type="rect" height="104px" />
      </div>
    </div>

    <q-skeleton type="text" width="120px" height="22px" class="q-mb-sm" />
    <div class="tf-card-grid" style="--tf-min: 280px">
      <q-card v-for="n in 3" :key="n" flat bordered>
        <q-card-section>
          <q-skeleton type="text" width="50%" class="q-mb-sm" />
          <q-skeleton v-for="line in 3" :key="line" type="text" />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 28px;
  align-items: flex-start;
}
.hero__badge {
  flex: 0 0 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero__next {
  flex: 1 1 260px;
  min-width: 0;
}
.badges {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 10px;
}
</style>
