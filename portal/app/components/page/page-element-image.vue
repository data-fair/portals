<template>
  <div
    v-if="src"
    :class="[
      'd-flex flex-column align-center overflow-hidden',
      element.banner && ((preview || !context.isRoot) ? 'banner-contained' : 'banner-fluid'),
      !preview && element.banner && element.sticky && context.isRoot && context.index === 0 && 'mt-n4',
      !preview && element.banner && element.sticky && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
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
      :style="imgStyle + ((!element.banner && element.zoomable && zoomedSrc) ? 'cursor:zoom-in;' : '')"
      :src="src"
      @click="!element.banner && element.zoomable ? zoomed = true : undefined"
    >
    <div
      v-if="!element.banner && element.legend"
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
const { preview } = usePortalStore()

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const display = useDisplay()

const image = computed(() => {
  if (element.banner && element.wideImage) return element.wideImage
  if (!element.image) return
  return element.image
})

const src = computed(() => {
  if (element.url) return element.url
  if (!image.value) return
  return getImageSrc(image.value, width.value < 1280)
})

const zoomedSrc = computed(() => {
  if (element.url) return element.url
  if (!image.value) return
  return getImageSrc(image.value, display.mobile.value)
})

const zoomed = ref(false)

const imgStyle = computed(() => {
  const isCover = element.cover || element.banner
  const fit = `object-fit:${isCover ? 'cover' : 'contain'};`
  const dims = isCover
    ? `width:100%;height:${element.height ? `${element.height}px` : '100%'};`
    : (element.height ? `height:${element.height}px;` : '')
  return `${fit}${dims}`
})
</script>

<style scoped>
.banner-fluid {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

.banner-contained {
  width: 100%;
}
</style>
