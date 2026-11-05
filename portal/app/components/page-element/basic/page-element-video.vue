<template>
  <v-video
    ref="player"
    :class="['bg-black', element.mb !== 0 && `mb-${element.mb ?? 4}`]"
    :aria-label="element.title"
    :aspect-ratio="ratio"
    :image="poster"
    :src="src"
    :type="element.asset?.mimeType ?? 'video/mp4'"
    controls-variant="tube"
    preload="metadata"
    rounded
  />
</template>

<script setup lang="ts">
import type { VideoElement } from '#api/types/page-elements/index.ts'
import { VVideo } from 'vuetify/labs/VVideo'

const { element } = defineProps<{ element: VideoElement }>()

const { t } = useI18n()
const getAssetSrc = useAssetSrc()
const src = computed(() => element.url ?? (element.asset && getAssetSrc(element.asset._id)))
const poster = computed(() => {
  if (element.posterUrl) return element.posterUrl
  return element.asset?.posterId ? getAssetSrc(element.asset.posterId) : undefined
})
const ratio = computed(() => {
  const { width, height } = element.asset ?? {}
  return width && height ? width / height : 16 / 9
})

// VVideo leaves its big play button without any accessible name
const player = useTemplateRef<{ $el: HTMLElement }>('player')
onMounted(() => {
  player.value?.$el.querySelector('button')?.setAttribute('aria-label', t('play', { title: element.title }))
})
</script>

<i18n lang="yaml">
  en:
    play: 'Play the video: { title }'
  fr:
    play: 'Lire la vidéo : { title }'
</i18n>
