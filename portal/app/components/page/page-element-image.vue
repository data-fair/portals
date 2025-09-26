<template>
  <template v-if="src">
    <a
      v-if="element.href && (element.href.startsWith('http://') || element.href.startsWith('https://'))"
      :href="element.href"
      target="_blank"
      rel="noopener"
    >
      <img
        ref="img"
        :alt="element.title"
        :style="element.height ? `height:${element.height}px` : ''"
        :src="src"
      >
    </a>
    <img
      v-else
      ref="img"
      :alt="element.title"
      :style="((element.zoomable && zoomedSrc) ? 'cursor:zoom-in;' : '') + (element.height ? `height:${element.height}px` : '')"
      :src="src"
      @click="element.zoomable ? zoomed = true : undefined"
    >
    <div
      v-if="element.legend"
      class="text-center text-caption font-italic"
    >
      {{ element.legend }}
    </div>
    <v-overlay
      v-if="element.zoomable && zoomedSrc"
      :model-value="zoomed"
      class="align-center justify-center"
      style="cursor:zoom-out"
      @click="zoomed = false"
    >
      <img
        :alt="element.title"
        :src="zoomedSrc"
      >
    </v-overlay>
  </template>
</template>

<script setup lang="ts">
import type { Image, ImageRef } from '~~/../api/types/page-config'
import { useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'

const { element } = defineProps({
  element: { type: Object as () => Image, required: true }
})

const imgEl = useTemplateRef('img')
const { width } = useElementSize(imgEl)

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const display = useDisplay()

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
