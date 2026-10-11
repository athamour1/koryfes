import { register } from 'register-service-worker'

// Νέα έκδοση: ο νέος service worker αναλαμβάνει αμέσως (skipWaiting), αλλά η
// σελίδα που είναι ήδη ανοιχτή τρέχει τον παλιό κώδικα. Το UpdatePrompt δείχνει
// «Ανανέωση» όταν συμβεί αυτό.
export const SW_UPDATED_EVENT = 'koryfes:sw-updated'

const HOUR = 60 * 60 * 1000

register(import.meta.env.QUASAR_SERVICE_WORKER_FILE, {
  registered (registration) {
    // Ο browser ελέγχει για νέο sw.js μόνο σε πλοήγηση· μια εγκατεστημένη
    // εφαρμογή που απλώς επιστρέφει από το παρασκήνιο δεν πλοηγείται ποτέ.
    const check = () => registration.update().catch(() => {})
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check()
    })
    setInterval(check, HOUR)
  },

  updated () {
    window.__koryfesUpdateReady = true
    window.dispatchEvent(new Event(SW_UPDATED_EVENT))
  },

  error (err) {
    console.error('Service worker registration failed:', err)
  }
})
