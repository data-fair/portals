<template>
  <v-card
    :to="!preview ? `/event/${pageConfig.eventMetadata?.slug}` : undefined"
    :elevation="cardConfig.elevation ?? portalConfig.defaults?.elevation"
    :rounded="cardConfig.rounded ?? portalConfig.defaults?.rounded"
    class="h-100 d-flex flex-column"
    link
  >
    <v-row class="flex-nowrap" no-gutters>
      <!-- Thumbnail (Left Location) -->
      <template v-if="cardConfig.thumbnail?.location === 'left' && !$vuetify.display.smAndDown">
        <v-col cols="4">
          <div
            v-if="thumbnailUrl"
            aria-hidden="true"
            :style="leftThumbnailStyle"
          />
        </v-col>
        <v-divider vertical />
      </template>

      <!-- Main column -->
      <v-col class="d-flex flex-column" style="min-width: 0">
        <!-- Thumbnail (Top Location) -->
        <v-img
          v-if="cardConfig.thumbnail && (cardConfig.thumbnail?.location === 'top' || (cardConfig.thumbnail?.location === 'left' && $vuetify.display.smAndDown)) && thumbnailUrl"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
          aria-hidden="true"
        />

        <v-card-title
          :class="['font-weight-bold', { 'text-two-lines': cardConfig.titleLinesCount === 2 }]"
          :style="[
            cardConfig.titleLinesCount === 0 ? { 'white-space': 'unset' } : {},
            cardConfig.titleLinesCount === 2 ? { height: titleHeight } : {}
          ]"
          :title="pageConfig.title"
        >
          {{ pageConfig.title }}
        </v-card-title>

        <!-- Dates -->
        <v-card-subtitle v-if="pageConfig.eventMetadata?.startDate" class="pb-2">
          <span>{{ dayjs(pageConfig.eventMetadata.startDate).format('L') }}</span>
          <template v-if="pageConfig.eventMetadata?.endDate">
            &nbsp;-&nbsp;
            <span>{{ dayjs(pageConfig.eventMetadata.endDate).format('L') }}</span>
          </template>
        </v-card-subtitle>

        <!-- Thumbnail (Center Location) -->
        <v-img
          v-if="cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
          aria-hidden="true"
        />

        <v-card-text v-if="cardConfig.showDescription && pageConfig.description?.length">
          {{ pageConfig.description }}
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page-config'
import type { EventCard } from '#api/types/portal-config'
import type { ImageRef } from '#api/types/image-ref/index.ts'

const { pageConfig, cardConfig, isPortalConfig } = defineProps<{
  pageConfig: Omit<PageConfig, 'elements'>
  cardConfig: EventCard
  isPortalConfig?: boolean
}>()

const { dayjs } = useLocaleDayjs()
const { portalConfig, preview } = usePortalStore()
const getPageImageSrc = usePageImageSrc()
const getPortalImageSrc = usePortalImageSrc()

const getEventImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/event/${pageConfig.eventMetadata?.slug}/images/${id}`
}

const thumbnailUrl = computed(() => {
  if (!cardConfig.thumbnail?.show) return undefined
  if (pageConfig.thumbnail) return getEventImageSrc(pageConfig.thumbnail, false)
  if (cardConfig.thumbnail?.default) return (isPortalConfig ? getPortalImageSrc : getPageImageSrc)(cardConfig.thumbnail.default, false)
  return undefined
})

const leftThumbnailStyle = computed(() => {
  if (!thumbnailUrl.value) return undefined
  return {
    backgroundImage: `url("${thumbnailUrl.value}")`,
    backgroundSize: cardConfig.thumbnail?.crop ? 'cover' : 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '200px',
    height: '100%'
  }
})

const titleHeight = ref<string>()
onMounted(() => {
  const titleElement = document.querySelector('.text-two-lines')
  if (titleElement) {
    const styles = getComputedStyle(titleElement)
    const lineHeight = parseFloat(styles.lineHeight)
    const paddingTop = parseFloat(styles.paddingTop)
    const paddingBottom = parseFloat(styles.paddingBottom)
    titleHeight.value = `${lineHeight * 2 + paddingTop + paddingBottom}px`
  }
})
</script>
