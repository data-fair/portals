<template>
  <div
    v-if="src"
    :class="[
      'd-flex flex-column align-center overflow-hidden',
      element.mb !== 0 && `mb-${element.mb ?? 4}`
    ]"
  >
    <a
      v-if="element.href && (element.href.startsWith('http://') || element.href.startsWith('https://'))"
      :href="element.href"
      target="_blank"
      rel="noopener"
    >
      <img
        ref="img"
        :alt="element.title"
        :style="imgStyle"
        :src="src"
      >
    </a>
    <img
      v-else
      ref="img"
      :alt="element.title"
      :style="imgStyle + ((element.zoomable && zoomedSrc) ? 'cursor:zoom-in;' : '')"
      :src="src"
      @click="element.zoomable ? zoomed = true : undefined"
    >
    <div
      v-if="element.legend"
      class="text-center text-caption font-italic"
    >
      {{ element.legend }}
    </div>
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

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { Image } from '#api/types/page-elements'
import { useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'

const { element } = defineProps<{
  element: Image
  context: {
    isRoot: boolean
    index: number
    parentLength: number
  }
}>()

const imgEl = useTemplateRef('img')
const { width } = useElementSize(imgEl)

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const display = useDisplay()

const src = computed(() => {
  if (element.url) return element.url
  if (!element.image) return
  return getImageSrc(element.image, width.value < 1280)
})

const zoomedSrc = computed(() => {
  if (element.url) return element.url
  if (!element.image) return
  return getImageSrc(element.image, display.mobile.value)
})

const zoomed = ref(false)

const imgStyle = computed(() => {
  const fit = `object-fit:${element.cover ? 'cover' : 'contain'};`
  const dims = element.cover
    ? `width:100%;height:${element.height ? `${element.height}px` : '100%'};`
    : (element.height ? `height:${element.height}px;` : '')
  return `${fit}${dims}`
})
</script>
