import { onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

// ίδιο όνομα με το src-pwa/register-sw.js (που υπάρχει μόνο στο PWA build)
const SW_UPDATED_EVENT = 'koryfes:sw-updated'

// Όταν ο service worker φέρει νέα έκδοση, μόνιμη ειδοποίηση με «Ανανέωση»
export function usePwaUpdatePrompt () {
  const $q = useQuasar()
  const { t } = useI18n()
  let shown = false

  const show = () => {
    if (shown) return
    shown = true
    $q.notify({
      message: t('pwa.updateAvailable'),
      icon: 'system_update',
      color: 'primary',
      position: 'bottom',
      timeout: 0,
      actions: [
        { label: t('pwa.reload'), color: 'white', noCaps: true, handler: () => window.location.reload() }
      ]
    })
  }

  onMounted(() => {
    // μπορεί να έχει ήδη συμβεί πριν φορτώσει η σελίδα
    if (window.__koryfesUpdateReady) show()
    window.addEventListener(SW_UPDATED_EVENT, show)
  })
  onUnmounted(() => window.removeEventListener(SW_UPDATED_EVENT, show))
}
