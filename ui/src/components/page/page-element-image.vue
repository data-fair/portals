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
import { Image } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Image, required: true }
})

// TODO: use image exposed by portal when opened in a portal
const src = computed(() => {
  if (element.url) return element.url
  if (!element.imageRef) return
  let id = element.imageRef._id
  if (element.imageRef.mobileAlt) id += '-mobile'
  return $apiPath + '/images/' + id + '/data'
})

const zoomedSrc = computed(() => {
  if (element.url) return element.url
  if (!element.imageRef) return
  return $apiPath + '/images/' + element.imageRef._id + '/data'
})

const zoomed = ref(false)
</script>
