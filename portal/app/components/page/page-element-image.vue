<template>
  <!--
    Accessibility (A11y) Logic:
      1. Banner Images: Considered decorative background, aria-hidden.
      2. Standard Images:
        - If 'isPresentation' is true: Purely decorative. Uses empty alt to be ignored by screen readers.
          (role="presentation" and aria-hidden="true" is redundant) => Ok for <img> but not for <v-img> tags.
        - Otherwise: Informative. Uses 'element.title' as the alternative text.
      3. Linked Images: Functional content. 'isPresentation' is incompatible here as links
        must have an accessible name.
      4. Zoomed/Interactive Images: Primarily for mouse users. However, for A11y safety,
        the presentation attributes are mirrored to ensure consistency across devices
        and prevent screen readers from announcing "ghost" interactive elements.
  -->
  <div
    v-if="src"
    :class="[
      'd-flex flex-column align-center overflow-hidden',
      element.banner && ((preview || !context.isRoot) ? 'banner-contained' : 'banner-fluid'),
      !preview && element.banner && context.isRoot && context.index === 0 && !showBreadcrumbs('top') && 'mt-n4',
      !preview && element.banner && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
      element.mb !== 0 && `mb-${element.mb ?? 4}`
    ]"
  >
    <a
      v-if="!element.isPresentation && element.href && (element.href.startsWith('http://') || element.href.startsWith('https://'))"
      :href="element.href"
      :title="element.title + ' - ' + t('newWindow')"
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
      :alt="element.isPresentation ? '' : element.title"
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
      :alt="element.isPresentation ? '' : element.title"
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

const { t } = useI18n()
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
  const fit = `object-fit:${(element.cover || element.banner) ? 'cover' : 'contain'};`
  const dims = (element.cover || element.banner)
    ? `width:100%;height:${element.height ? `${element.height}px` : '100%'};`
    : (element.height ? `height:${element.height}px;` : '')
  return `${fit}${dims}`
})

// If breadcrumbs are displayed and the banner is at the top, don't apply the negative margin.
const { showBreadcrumbs } = useNavigationStore()

</script>

<i18n lang="yaml">
  en:
    newWindow: New window
  fr:
    newWindow: Nouvelle fenêtre
</i18n>

<style scoped>
.banner-fluid {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
</style>
