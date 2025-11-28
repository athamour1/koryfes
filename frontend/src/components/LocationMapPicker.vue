<template>
  <div class="location-map-picker">
    <div ref="mapContainer" class="map-container"></div>
    <div v-if="!modelValue.latitude || !modelValue.longitude" class="map-hint">
      <q-icon name="info" size="sm" class="q-mr-xs" />
      {{ $t('locationManagement.map.clickToPlace') }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ latitude: null, longitude: null })
  }
})

const emit = defineEmits(['update:modelValue'])

const mapContainer = ref(null)
let map = null
let marker = null

// Default center (Athens, Greece)
const DEFAULT_CENTER = [37.9838, 23.7275]
const DEFAULT_ZOOM = 6

onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

const initMap = () => {
  if (!mapContainer.value) return

  // Initialize map
  map = L.map(mapContainer.value, {
    center: props.modelValue.latitude && props.modelValue.longitude 
      ? [props.modelValue.latitude, props.modelValue.longitude]
      : DEFAULT_CENTER,
    zoom: props.modelValue.latitude && props.modelValue.longitude ? 13 : DEFAULT_ZOOM,
    zoomControl: true
  })

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map)

  // Add existing marker if coordinates exist
  if (props.modelValue.latitude && props.modelValue.longitude) {
    addMarker(props.modelValue.latitude, props.modelValue.longitude)
  }

  // Click event to place marker
  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    addMarker(lat, lng)
    emit('update:modelValue', { latitude: lat, longitude: lng })
  })
}

const addMarker = (lat, lng) => {
  // Remove existing marker
  if (marker) {
    map.removeLayer(marker)
  }

  // Add new marker
  marker = L.marker([lat, lng], {
    draggable: true,
    icon: L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }).addTo(map)

  // Update coordinates when marker is dragged
  marker.on('dragend', (e) => {
    const position = e.target.getLatLng()
    emit('update:modelValue', { latitude: position.lat, longitude: position.lng })
  })

  // Center map on marker
  map.setView([lat, lng], map.getZoom())
}

// Watch for external coordinate changes
watch(() => props.modelValue, (newVal) => {
  if (newVal.latitude && newVal.longitude && map) {
    addMarker(newVal.latitude, newVal.longitude)
  }
}, { deep: true })
</script>

<style scoped>
.location-map-picker {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.map-hint {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  font-size: 14px;
  z-index: 1000;
  pointer-events: none;
}

/* Fix Leaflet default styles */
:deep(.leaflet-container) {
  font-family: inherit;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}
</style>
