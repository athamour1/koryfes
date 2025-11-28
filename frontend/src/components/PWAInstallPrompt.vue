<template>
  <q-dialog v-model="showPrompt" position="bottom" seamless>
    <q-card class="bg-primary text-white" style="width: 100%">
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="download" size="md" class="q-mr-md" />
        <div class="col">
          <div class="text-subtitle2">{{ $t('pwa.installTitle') }}</div>
          <div class="text-caption">{{ $t('pwa.installMessage') }}</div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat dense :label="$t('pwa.dismiss')" @click="dismissPrompt" color="white" />
        <q-btn flat dense :label="$t('pwa.install')" @click="installPWA" color="white" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const showPrompt = ref(false)
const deferredPrompt = ref(null)

const STORAGE_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 30 * 24 * 60 * 60 * 1000

const isDismissed = () => {
  const dismissedTime = localStorage.getItem(STORAGE_KEY)
  if (!dismissedTime) return false
  const elapsed = Date.now() - parseInt(dismissedTime)
  return elapsed < DISMISS_DURATION
}

const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

const handleBeforeInstallPrompt = (e) => {
  e.preventDefault()
  deferredPrompt.value = e
  if ($q.platform.is.mobile && !isDismissed() && !isAppInstalled()) {
    showPrompt.value = true
  }
}

const installPWA = async () => {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  console.log('User', outcome, 'the install prompt')
  deferredPrompt.value = null
  showPrompt.value = false
}

const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem(STORAGE_KEY, Date.now().toString())
}

const handleAppInstalled = () => {
  showPrompt.value = false
  deferredPrompt.value = null
  console.log('PWA was installed')
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>
