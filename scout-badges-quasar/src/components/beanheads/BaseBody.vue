<script setup>
import { inject } from 'vue'
import { colors } from './constants/theme.js'

const theme = inject('theme')
const skin = theme?.skin || { base: colors.skin.light.base, shadow: colors.skin.light.shadow }
</script>

<template>
  <!-- Body/Torso/Neck - renders BELOW scarf -->
  <path
    d="M610,758.72c90.76,0,72,114.24,72.87,241.28H610Z"
    :fill="skin.base"
  />
  <path
    d="M632.74,831.87,610,870l11.38,130h31.76C653.91,819.73,632.74,831.87,632.74,831.87Z"
    :fill="skin.shadow"
  />
  <path
    d="M619.47,1070H380.53a13.28,13.28,0,0,1-13.27-13.28V772a13.28,13.28,0,0,1,13.27-13.28H613.76c13.09,0,19,7.66,19,19.88v278.08A13.28,13.28,0,0,1,619.47,1070Z"
    :fill="skin.base"
  />
  <path
    d="M629.05,766.62a19.33,19.33,0,0,1-2.51-4,17.25,17.25,0,0,0-8.28-3.51,28.88,28.88,0,0,0-4.5-.34H380.53A13.28,13.28,0,0,0,367.26,772c29,10.42,83.29,16.24,132.74,16.24C563.06,788.24,604.38,778.89,629.05,766.62Z"
    :fill="skin.shadow"
  />
  <path
    d="M610,758.72c90.76,0,72,114.24,72.87,241.28H632.74"
    fill="none" 
    :stroke="colors.outline"
    stroke-linecap="square"
    :stroke-miterlimit="10"
    stroke-width="12px"
  />
  <path
    d="M386.12,758.72c-90.77,0-72,114.24-72.87,241.28h50.07"
    fill="none"
    :stroke="colors.outline"
    stroke-linecap="square"
    :stroke-miterlimit="10"
    stroke-width="12px"
  />

  <path
    d="M380.53,758.82l233.23-.1"
    fill="none"
    :stroke="colors.outline"
    :stroke-miterlimit="10"
    stroke-width="12px"
  />
  <path
    d="M380.53,1070H497.15C388,1070,396.24,838.82,367.26,838.82v217.86A13.28,13.28,0,0,0,380.53,1070Z"
    :fill="skin.shadow"
  />
  <path
    d="M361.26,860.85c-.19-3.67-.11-7.34.05-11s.47-7.35.86-11c.20-1.84.40-3.67.65-5.51s.49-3.67.85-5.51a44.18,44.18,0,0,1,3.59-11,44.18,44.18,0,0,1,3.59,11c.36,1.84.62,3.67.85,5.51s.45,3.67.65,5.51c.38,3.67.68,7.34.85,11s.25,7.34.06,11Z"
    :fill="colors.outline"
  />
  <path
    d="M632.74,870v8c.26,34,.26,69,0,102.75,0,2.87,0,5.72,0,8.53v67.41A13.28,13.28,0,0,1,619.47,1070H380.53a13.28,13.28,0,0,1-13.27-13.28V998.52c0-2.51,0-5.07,0-7.65-.25-34.87-.25-69.87,0-105.3V860.85"
    fill="none"
    :stroke="colors.outline"
    :stroke-miterlimit="10"
    stroke-width="12px"  
  />
  <path
    d="M626.74,870c-.19-4.17-.1-8.35.06-12.53s.47-8.35.85-12.53c.2-2.09.41-4.18.65-6.27s.49-4.17.85-6.26a55.09,55.09,0,0,1,3.59-12.53,55.09,55.09,0,0,1,3.59,12.53c.36,2.09.62,4.18.85,6.26s.45,4.18.65,6.27c.38,4.18.69,8.35.85,12.53s.25,8.36.06,12.53Z"
    :fill="colors.outline"
  />
  <path
    d="M386.12,758.72c-90.77,0-72,114.24-72.87,241.28h72.87Z"
    :fill="skin.base"
  />
  <path
    d="M367.23,831.87,390,870l-11.39,130H346.88C346.07,819.73,367.23,831.87,367.23,831.87Z"
    :fill="skin.shadow"
  />
</template>
