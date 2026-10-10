<template>
  <q-page class="tf-page column items-center justify-center text-center">
    <div class="tf-tile tf-rise" style="--tile-size: 88px; border-radius: 24px">
      <q-icon name="explore" size="48px" class="compass" />
    </div>
    <h1 class="page-title q-mt-lg q-mb-xs">{{ $t('error404.title') }}</h1>
    <div class="text-body1 text-grey-7 q-mb-lg">{{ $t('error404.message') }}</div>
    <div class="row q-gutter-sm justify-center">
      <q-btn unelevated no-caps color="primary" icon="home" :label="$t('error404.returnHome')" to="/" />
      <q-btn flat no-caps color="primary" icon="arrow_back" :label="$t('error404.goBack')" @click="$router.back()" />
    </div>
  </q-page>
</template>

<style scoped>
/* Η πυξίδα «ψάχνει» — μια φορά, όχι επ' άπειρον. */
.compass {
  animation: compass-search 1400ms var(--ease-emphasized) both;
}
@keyframes compass-search {
  0% {
    transform: rotate(-40deg);
  }
  45% {
    transform: rotate(25deg);
  }
  75% {
    transform: rotate(-10deg);
  }
  100% {
    transform: rotate(0);
  }
}
</style>
