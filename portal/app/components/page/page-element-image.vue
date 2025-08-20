<!-- eslint-disable vue/no-v-html -->
<template>
  <a
    v-if="element.href && (element.href.startsWith('http://') || element.href.startsWith('https://'))"
    :href="element.href"
    target="_blank"
  >
    <v-img
      :style="element.height ? `height:${element.height}px` : ''"
      :src="src"
      :title="element.title"
    />
  </a>
  <v-img
    v-else
    :style="(element.zoomable ? 'cursor:zoom-in;' : '') + (element.height ? `height:${element.height}px` : '')"
    :src="src"
    :title="element.title"
    @click="element.zoomable ? zoomed = true : undefined"
  />
  <div
    v-if="element.legend"
    class="text-center text-caption font-italic"
  >
    {{ element.legend }}
  </div>
  <v-overlay
    :model-value="zoomed"
    style="cursor:zoom-out"
    @click="zoomed = false"
  >
    <v-img
      :src="zoomedSrc"
    />
  </v-overlay>
</template>

<script setup lang="ts">
import type { Image, ImageRef } from '~~/../api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Image, required: true }
})

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

// TODO: use image exposed by portal when opened in a portal
const src = computed(() => {
  if (element.url) return element.url
  if (!element.imageRef) return
  return getImageSrc(element.imageRef, true)
})

const zoomedSrc = computed(() => {
  if (element.url) return element.url
  if (!element.imageRef) return
  return getImageSrc(element.imageRef, false)
})

const zoomed = ref(false)
</script>
