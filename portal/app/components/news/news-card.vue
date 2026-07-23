<template>
  <!--
    link => keeps the ripple, hover styles and pointer cursor while rendering a
    div: the actual link is the overlay below, see card-overlay-link
  -->
  <v-card
    v-bind="hoverProps"
    :elevation="hoverFx.elevation(isHovering, cardConfig.elevation ?? portalConfig.defaults?.elevation)"
    :color="hoverFx.background(isHovering)"
    :rounded="cardConfig.rounded ?? portalConfig.defaults?.rounded"
    class="h-100 d-flex flex-column"
    :style="hoverFx.rootStyle(isHovering)"
    link
  >
    <!-- no link in preview -->
    <card-overlay-link
      v-if="!preview"
      :to="`/news/${pageConfig.newsMetadata?.slug}`"
      :label="pageConfig.title"
    />

    <v-row class="flex-nowrap" no-gutters>
      <!-- Thumbnail (Left Location) -->
      <template v-if="cardConfig.thumbnail?.show && cardConfig.thumbnail?.location === 'left' && !$vuetify.display.smAndDown">
        <v-col cols="4" class="overflow-hidden">
          <div
            v-if="thumbnailUrl"
            aria-hidden="true"
            :style="[leftThumbnailStyle, hoverFx.imageStyle(isHovering)]"
          />
        </v-col>
        <v-divider vertical />
      </template>

      <!-- Main column -->
      <v-col class="d-flex flex-column" style="min-width: 0">
        <!-- Thumbnail (Top Location) -->
        <div
          v-if="cardConfig.thumbnail?.show && (cardConfig.thumbnail?.location === 'top' || (cardConfig.thumbnail?.location === 'left' && $vuetify.display.smAndDown)) && thumbnailUrl"
          aria-hidden="true"
          class="flex-grow-0 overflow-hidden"
        >
          <v-img
            :src="thumbnailUrl"
            :cover="cardConfig.thumbnail.crop"
            height="170"
            alt=""
            :style="hoverFx.imageStyle(isHovering)"
          />
        </div>

        <card-hover-title
          :title="pageConfig.title"
          :lines-count="cardConfig.titleLinesCount"
          :hover-fx="hoverFx"
          :is-hovering="isHovering"
        />

        <!-- Publication date -->
        <v-card-subtitle v-if="pageConfig.newsMetadata?.date" class="pb-2">
          {{ t('publishedOn') }} {{ dayjs(pageConfig.newsMetadata.date).format('LL') }}
        </v-card-subtitle>

        <!-- Thumbnail (Center Location) -->
        <div
          v-if="cardConfig.thumbnail?.show && cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
          aria-hidden="true"
          class="flex-grow-0 overflow-hidden"
        >
          <v-img
            :src="thumbnailUrl"
            :cover="cardConfig.thumbnail.crop"
            height="170"
            alt=""
            :style="hoverFx.imageStyle(isHovering)"
          />
        </div>

        <v-card-text v-if="(cardConfig.showDescription || (cardConfig.thumbnail?.show && cardConfig.thumbnail?.useDescription && !thumbnailUrl)) && pageConfig.description?.length">
          {{ pageConfig.description }}
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page-config'
import type { NewsCard } from '#api/types/portal-config'
import type { ImageRef } from '#api/types/image-ref/index.ts'

const { pageConfig, cardConfig, isPortalConfig } = defineProps<{
  pageConfig: Omit<PageConfig, 'elements'>
  cardConfig: NewsCard
  isPortalConfig?: boolean
}>()

const { dayjs } = useLocaleDayjs()
const { portalConfig, preview } = usePortalStore()
const { t } = useI18n()
const getPageImageSrc = usePageImageSrc()
const getPortalImageSrc = usePortalImageSrc()
const hoverFx = useHoverConfig(() => cardConfig.hover)
const { isHovering, hoverProps } = useHoverState()

const getNewsImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/news/${pageConfig.newsMetadata?.slug}/images/${id}`
}

const thumbnailUrl = computed(() => {
  if (pageConfig.thumbnail) return getNewsImageSrc(pageConfig.thumbnail, false)
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

</script>

<i18n lang="yaml">
  en:
    publishedOn: Published on
  fr:
    publishedOn: Publiée le
</i18n>
