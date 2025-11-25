<script setup>
// Vue core
import { computed, watch, reactive, provide, readonly, toRef } from 'vue'

// Theme
import { colors } from './constants/theme.js'

// Base components
import Base from './Base.vue'
import BaseBody from './BaseBody.vue'
import Mask from './Mask.vue'
import BgCircle from './BgCircle.vue'
import FaceMask from './FaceMask.vue'

// Feature components
import Accessory from './accessories/Accessory.vue'
import Body from './bodies/Body.vue'
import Clothing from './clothings/Clothing.vue'
import ClothingGraphic from './clothingGraphics/ClothingGraphic.vue'
import Eye from './eyes/Eye.vue'
import Eyebrows from './eyebrows/Eyebrows.vue'
import FacialHair from './facialHairs/FacialHair.vue'
import Hair from './hairs/Hair.vue'
import Hat from './hats/Hat.vue'
import Mouth from './mouths/Mouth.vue'
import Scarf from './accessories/Scarf.vue'

const props = defineProps({
  // Layout
  mask: { type: Boolean, default: false },

  // Body
  skin: { type: String, default: 'light' },
  body: { type: String, default: 'chest' },
  braStraps: { type: Boolean, default: true },

  // Head/Face
  eye: { type: String, default: 'normal-eyes' },
  withLashes: { type: Boolean, default: false },
  eyebrows: { type: String, default: 'none' },
  mouth: { type: String, default: 'grin' },
  lipColor: { type: String, default: 'red' },
  facialHair: { type: String, default: 'none' },

  // Hair
  hair: { type: String, default: 'none' },
  hairColor: { type: String, default: 'white' },

  // Clothing
  clothing: { type: String, default: 'none' },
  clothingColor: { type: String, default: 'white' },
  clothingGraphic: { type: String, default: 'none' },

  // Accessories
  accessory: { type: String, default: 'none' },
  hat: { type: String, default: 'none' },
  hatColor: { type: String, default: 'white' },
  faceMask: { type: Boolean, default: false },
  faceMaskColor: { type: String, default: 'white' },

  // Scarf (positioning and color only - always visible)
  scarfColor: { type: String, default: 'blue' },
  scarfOffsetX: { type: Number, default: 275 },
  scarfOffsetY: { type: Number, default: 625 },
  scarfRotation: { type: Number, default: 0 },
  scarfScale: { type: Number, default: 0.8 },
})

const clothingVisibility = computed(() => ({
  'none': {
    front: false,
    back: false,
  },
  'naked': {
    front: false,
    back: false,
  },
  'dress': {
    front: true,
    back: true,
  },
  'shirt': {
    front: false,
    back: true,
  },
  'dress-shirt': {
    front: false,
    back: true,
  },
  'tank-top': {
    front: false,
    back: true,
  },
  'v-neck': {
    front: false,
    back: true,
  },
})[props.clothing])

const theme = reactive({
  skin: props.skin ? colors.skin[props.skin] : colors.skin.light
})

watch(() => props.skin, (skin) => {
  theme.skin = colors.skin[skin]
})

provide('theme', {
  skin: readonly(toRef(theme, 'skin'))
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 990 990"
  >
    <Mask v-if="mask" id="mask" />
    <g
      :mask="mask ? 'url(#mask)' : undefined"
    >
      <!-- <BgCircle v-if="mask" /> -->

      <Hat 
        position="back" 
        :type="hat" 
        :color="hatColor"
        :hairType="hair"
      />

      <Hair
        position="back" 
        :type="hair" 
        :color="hairColor" 
        :hasHat="hat !== 'none'"
      />

      <!-- BaseBody: Body/torso (bottom layer) -->
      <BaseBody/>

      <Body
        :type="body"
        :color="clothingColor"
        position="back"
        :bra-straps="braStraps"
      />

      <Clothing 
        position="back" 
        :type="clothing"
        :color="clothingColor"
      >
        <template #graphic>
          <ClothingGraphic 
            :type="clothingGraphic" 
          />
        </template>
      </Clothing>

      <Body
        v-if="clothingVisibility.front || clothingVisibility.back"
        position="front"
        :type="body"
        :color="clothing === 'dress-shirt' ? 'white' : clothingColor"
        :bra-straps="braStraps"
      />

      <Clothing
        v-if="clothingVisibility.front"
        position="front"
        :type="clothing"
        :color="clothingColor"
      />

      <!-- SCARF: Always visible, drapes over clothing -->
      <Scarf
        :color="scarfColor"
        :offset-x="scarfOffsetX"
        :offset-y="scarfOffsetY"
        :rotation="scarfRotation"
        :scale="scarfScale"
      />

      <!-- Base: Head/face circle renders AFTER scarf to cover it -->
      <Base/>

      <FacialHair 
        v-if="!faceMask"
        :type="facialHair" 
        :color="hairColor" 
      />

      <Eye 
        :type="eye" 
        :with-lashes="withLashes" 
      />

      <Mouth
        :type="mouth" 
        :color="lipColor" 
      />

      <FaceMask 
        v-if="faceMask" 
        :color="faceMaskColor" 
      />

      <Hair
        position="front"
        :type="hair"
        :color="hairColor"
        :hasHat="hat !== 'none'"
      />

      <Eyebrows :type="eyebrows" />

      <Hat 
        position="front" 
        :type="hat" 
        :color="hatColor" 
        :hairType="hair"
      />

      <Accessory 
        :type="accessory"
      />
    </g>
  </svg>
</template>
