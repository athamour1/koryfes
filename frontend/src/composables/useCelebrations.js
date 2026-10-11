import { computed, ref } from 'vue'
import { api } from '@/api'
import { diplomaImage, peakImage } from '@/utils/badges'

// Τα μεγάλα ορόσημα που γιορτάζουμε: Υπόσχεση και Κορυφές, και μετά τη Γ'
// Κορυφή κάθε νέο Πτυχίο Κλάδου. Ο server θυμάται τι έχει ήδη γιορταστεί
// (celebratedPeakOrder / celebratedElectiveIds), οπότε γιορτάζεται μία φορά
// σε όποια συσκευή ανοίξει πρώτη.
export function pendingCelebrations (progress) {
  if (!progress) return []
  const peak = progress.currentPeak
  const order = peak?.order ?? 0

  // ένα μόνο, το ψηλότερο: Υπόσχεση και Α' Κορυφή μαζί γιορτάζονται ως Α'
  if (order > (progress.celebratedPeakOrder ?? 0)) {
    return [{ key: `peak-${peak.type}`, kind: peak.type, image: peakImage(peak), name: peak.name }]
  }

  if (peak?.type === 'gold') {
    const seen = new Set(progress.celebratedElectiveIds ?? [])
    return (progress.electiveDiplomas ?? [])
      .filter((d) => !seen.has(d.id))
      .map((d) => ({ key: `diploma-${d.id}`, kind: 'diploma', image: diplomaImage(d), name: d.name }))
  }

  return []
}

export function useCelebrations () {
  const queue = ref([])
  const current = computed(() => queue.value[0] ?? null)
  let checking = false

  const check = async () => {
    if (checking || queue.value.length) return
    checking = true
    try {
      const { data } = await api.get('/user-progress/me')
      queue.value = pendingCelebrations(data)
    } catch {
      // χωρίς σύνδεση ή χωρίς πρόοδο: απλώς καμία γιορτή
    } finally {
      checking = false
    }
  }

  // το επόμενο της ουράς· όταν τελειώσουν όλα, το λέμε στον server
  const next = async () => {
    queue.value = queue.value.slice(1)
    if (!queue.value.length) {
      try {
        await api.post('/user-progress/me/celebrated')
      } catch {
        // θα ξαναεμφανιστεί την επόμενη φορά· όχι πρόβλημα
      }
    }
  }

  return { current, check, next }
}
