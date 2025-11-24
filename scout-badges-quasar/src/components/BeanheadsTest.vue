<template>
  <div class="q-pa-md">
    <h1>Beanheads Avatar Test</h1>
    
    <div class="row q-gutter-md">
      <!-- Example 1: Default Avatar -->
      <q-card class="col-3">
        <q-card-section>
          <div class="text-h6">Default</div>
        </q-card-section>
        <q-card-section>
          <Avatar />
        </q-card-section>
      </q-card>

      <!-- Example 2: Custom Avatar 1 -->
      <q-card class="col-3">
        <q-card-section>
          <div class="text-h6">With Hair & Glasses</div>
        </q-card-section>
        <q-card-section>
          <Avatar
            skin="brown"
            hair="bob"
            hairColor="blonde"
            eye="normal-eyes"
            withLashes
            eyebrows="normal"
            mouth="grin"
            clothing="shirt"
            clothingColor="blue"
            accessory="round-glasses"
            mask
          />
        </q-card-section>
      </q-card>

      <!-- Example 3: Custom Avatar 2 -->
      <q-card class="col-3">
        <q-card-section>
          <div class="text-h6">With Hat & Beard</div>
        </q-card-section>
        <q-card-section>
          <Avatar
            skin="dark"
            hair="short"
            hairColor="black"
            eye="happy-eyes"
            eyebrows="normal"
            mouth="grin"
            facialHair="medium-beard"
            clothing="vneck"
            clothingColor="green"
            hat="beanie"
            hatColor="red"
            mask
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import Avatar from './beanheads/Avatar.vue'
</script>
