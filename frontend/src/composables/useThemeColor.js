import { onBeforeUnmount, onMounted, watch } from 'vue'

// Η μπάρα του συστήματος (theme-color) παίρνει το χρώμα που φαίνεται στην
// κορυφή του παραθύρου: το header όταν πιάνει όλο το πλάτος (κινητό), αλλιώς
// το φόντο της σελίδας (πλωτό header από 1024px, σελίδες χωρίς header).
// Ίδιο όριο με το app.scss.
const FLOATING_HEADER = '(min-width: 1024px)'

// Το φόντο μπορεί να είναι color-mix(); το meta θέλει απλό χρώμα, οπότε το
// «ζωγραφίζουμε» σε canvas και κρατάμε το pixel σε hex.
const toHex = (cssColor) => {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = cssColor
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

export function useThemeColor (headerVisible, isDark) {
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  const wide = window.matchMedia(FLOATING_HEADER)
  let timer = null

  const apply = () => {
    const header = document.querySelector('.q-layout > .q-header')
    const el = headerVisible.value && header && !wide.matches ? header : document.body
    meta.setAttribute('content', toHex(getComputedStyle(el).backgroundColor))
  }
  // ξανά μετά το transition του φόντου (αλλαγή φωτεινό/σκοτεινό)
  const update = () => {
    requestAnimationFrame(apply)
    clearTimeout(timer)
    timer = setTimeout(apply, 400)
  }

  watch([headerVisible, isDark], update)
  onMounted(() => {
    update()
    wide.addEventListener('change', update)
  })
  onBeforeUnmount(() => {
    clearTimeout(timer)
    wide.removeEventListener('change', update)
  })
}
