<template>
  <v-container
    class="pa-0 position-relative"
    fluid
  >
    <!-- Fond rouge dynamique et centré -->
    <div
      class="red-background"
      :style="{
        height: backgroundHeight + 'px',
        top: backgroundTop + 'px'
      }"
    ></div>

    <!-- Première boîte -->
    <div
      ref="box1"
      class="box1 position-relative"
    >
      <p>Contenu dynamique de la première boîte</p>
      <p>Ajoute ou retire du texte ici pour voir le fond rouge s’adapter et rester centré.</p>
    </div>

    <!-- Seconde boîte -->
    <div class="box2 mt-4 position-relative">
      <p>Contenu dynamique de la seconde boîte</p>
      <p>Elle suit naturellement sous la première.</p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const MIN_HEIGHT = 150
const box1 = ref<HTMLElement | null>(null)
const backgroundHeight = ref(MIN_HEIGHT)
const backgroundTop = ref(0)

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!box1.value) return

  const updateBackground = () => {
    const boxRect = box1.value?.getBoundingClientRect()
    if (!boxRect || !box1.value) return

    const h = box1.value.offsetHeight
    const desiredHeight = Math.max(h, MIN_HEIGHT)
    backgroundHeight.value = desiredHeight
    backgroundTop.value = box1.value.offsetTop + (h / 2 - desiredHeight / 2)
  }

  observer = new ResizeObserver(updateBackground)
  observer.observe(box1.value)
  updateBackground()
})

onBeforeUnmount(() => {
  if (observer && box1.value) observer.unobserve(box1.value)
})
</script>

<style scoped>
.red-background {
  position: absolute;
  left: 0;
  right: 0;
  background-color: red;
  z-index: 0;
}

.box1,
.box2 {
  position: relative;
  z-index: 1;
}
</style>
