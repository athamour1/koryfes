<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'blue'
  },
  offsetX: {
    type: Number,
    default: 275
  },
  offsetY: {
    type: Number,
    default: 625
  },
  rotation: {
    type: Number,
    default: 0
  },
  scale: {
    type: Number,
    default: 0.8
  }
})

const transform = computed(() => {
  return `translate(${props.offsetX}, ${props.offsetY}) rotate(${props.rotation}) scale(${props.scale})`
})

// Color mapping for scarf colors
const colorMap = {
  blue: {
    primary: '#3875C1',
    secondary: '#4A9FD8',
    dark: '#1E2F4D'
  },
  green: {
    primary: '#38C14D',
    secondary: '#7BC77D',
    dark: '#1E4D28'
  },
  yellow: {
    primary: '#FFC138',
    secondary: '#FFD966',
    dark: '#4D3A1E'
  },
  'dark-blue': {
    primary: '#2E5ACE',
    secondary: '#4169E1',
    dark: '#0F2057'
  },
  turquoise: {
    primary: '#30D5C8',
    secondary: '#40E0D0',
    dark: '#0C514D'
  },
  red: {
    primary: '#C13838',
    secondary: '#EF5350',
    dark: '#4D1E1E'
  },
}

const c = computed(() => {
  return colorMap[props.color] || colorMap.blue
})
</script>

<template>
  <g class="scarf-simple" :transform="transform">
    <!-- Neckerchief-style scarf draped horizontally -->
    <defs>
      <linearGradient :id="`scarf-gradient-${color}`" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" :stop-color="c.secondary" />
        <stop offset="50%" :stop-color="c.primary" />
        <stop offset="100%" :stop-color="c.secondary" />
      </linearGradient>
    </defs>
    
    <!-- Main horizontal band -->
    <path 
      :fill="`url(#scarf-gradient-${color})`"
      d="M -120 -20 Q -60 -30, 0 -25 Q 60 -30, 120 -20 L 110 20 Q 55 5, 0 10 Q -55 5, -110 20 Z"
      :stroke="c.dark"
      stroke-width="2"
      opacity="0.95"
    />
    
    <!-- Left tail -->
    <path 
      :fill="c.primary"
      d="M -120 -20 L -100 -15 L -80 50 L -105 55 L -125 10 Z"
      :stroke="c.dark"
      stroke-width="2"
    />
    
    <!-- Right tail -->
    <path 
      :fill="c.secondary"
      d="M 120 -20 L 100 -15 L 80 50 L 105 55 L 125 10 Z"
      :stroke="c.dark"
      stroke-width="2"
    />
    
    <!-- Center knot overlay -->
    <ellipse 
      cx="0" 
      cy="0" 
      rx="25" 
      ry="20"
      :fill="c.dark"
      opacity="0.3"
    />
    
    <!-- Highlights on tails -->
    <path 
      :fill="c.secondary"
      opacity="0.5"
      d="M -110 -10 L -105 -8 L -95 30 L -100 28 Z"
    />
    
    <path 
      :fill="c.secondary"
      opacity="0.5"
      d="M 110 -10 L 105 -8 L 95 30 L 100 28 Z"
    />
  </g>
</template>
