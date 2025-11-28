<template>
  <q-page class="flex flex-center" style="background-color: #f5f5f5;">
    <div class="column items-center q-gutter-md" style="max-width: 600px; width: 100%;">
      <h1 class="text-h4 text-weight-bold q-mb-md">Scarf Color Test</h1>
      
      <q-banner v-if="error" class="bg-negative text-white q-mb-md" rounded>
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        <strong>Error:</strong> {{ error }}
      </q-banner>
      
      <div class="full-width">
        <q-select
          v-model="scarfColor"
          :options="scarfOptions"
          label="Select Scarf Color"
          outlined
          emit-value
          map-options
          style="max-width: 300px; margin: 0 auto;"
        />
      </div>

      <q-card flat bordered style="width: 384px; height: 384px; overflow: hidden;">
        <q-card-section class="q-pa-none" style="height: 100%;">
          <AvatarDisplay 
            :config="{
              clothing: 'shirt',
              clothingColor: 'white',
              scarfColor: scarfColor,
              scarfOffsetX: 275,
              scarfOffsetY: 625,
              scarfRotation: 0,
              scarfScale: 0.8
            }"
            size="100%"
          />
        </q-card-section>
      </q-card>
      
      <div class="text-caption text-grey-7">
        Current Color: <span class="text-weight-bold" style="font-family: monospace;">{{ scarfColor }}</span>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import AvatarDisplay from '../components/AvatarDisplay.vue'

const scarfColor = ref('light-blue')
const error = ref(null)

const scarfOptions = [
  { label: 'Light Blue - Κλαδος Οδηγων', value: 'light-blue' },
  { label: 'Navy - Ναυτοδηγων', value: 'navy' },
  { label: 'Red - ΜΟ', value: 'red' },
  { label: 'Yellow - Πουλιων', value: 'yellow' }
]

onErrorCaptured((err) => {
  console.error('Captured error:', err)
  error.value = err.toString()
  return false // prevent propagation
})
</script>
