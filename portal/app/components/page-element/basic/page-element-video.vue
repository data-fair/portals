<template>
  <v-video
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :aria-label="element.title"
    :aspect-ratio="ratio"
    :image="poster"
    :src="src"
    :type="element.asset.mimeType"
    controls-variant="tube"
    preload="metadata"
    rounded
  />
</template>

<script setup lang="ts">
import type { VideoElement } from '#api/types/page-elements/index.ts'
import { VVideo } from 'vuetify/labs/VVideo'

const { element } = defineProps<{ element: VideoElement }>()

const getAssetSrc = useAssetSrc()
const src = computed(() => getAssetSrc(element.asset._id))
const poster = computed(() => element.asset.posterId ? getAssetSrc(element.asset.posterId) : undefined)
const ratio = computed(() => {
  const { width, height } = element.asset
  return width && height ? width / height : 16 / 9
})
</script>
