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
import { useElementSize, useCurrentElement } from '@vueuse/core'
import { useDisplay } from 'vuetify'

const { element } = defineProps({
  element: { type: Object as () => Image, required: true }
})

const { width } = useElementSize(useCurrentElement())

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const display = useDisplay()

// TODO: use image exposed by portal when opened in a portal
const src = computed(() => {
  if (element.url) return element.url
  if (!element.imageRef) return
  return getImageSrc(element.imageRef, width.value < 1280)
})

const zoomedSrc = computed(() => {
  if (element.url) return element.url
  if (!element.imageRef) return
  return getImageSrc(element.imageRef, display.mobile.value)
})

const zoomed = ref(false)
</script>
