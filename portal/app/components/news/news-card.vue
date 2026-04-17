<template>
  <v-card
    :to="!preview ? `/news/${pageConfig.newsMetadata?.slug}` : undefined"
    :elevation="cardConfig.elevation ?? portalConfig.defaults?.elevation"
    :rounded="cardConfig.rounded ?? portalConfig.defaults?.rounded"
    class="h-100 d-flex flex-column"
    link
  >
    <v-row class="flex-nowrap" no-gutters>
      <!-- Thumbnail (Left Location) -->
      <template v-if="cardConfig.thumbnail?.show && cardConfig.thumbnail?.location === 'left' && !$vuetify.display.smAndDown">
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
          v-if="cardConfig.thumbnail?.show && (cardConfig.thumbnail?.location === 'top' || (cardConfig.thumbnail?.location === 'left' && $vuetify.display.smAndDown)) && thumbnailUrl"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
          aria-hidden="true"
        />

        <!--
          text-two-lines => truncate title to 2 lines
          white-space: unset; => remove default nowrap from v-card-title
        -->
        <v-card-title
          :class="['font-weight-bold', { 'text-two-lines my-2 py-0': cardConfig.titleLinesCount === 2 }]"
          :style="[cardConfig.titleLinesCount === 0 ? { 'white-space': 'unset' } : {}]"
          :title="pageConfig.title"
        >
          {{ pageConfig.title }}
        </v-card-title>

        <!-- Publication date -->
        <v-card-subtitle v-if="pageConfig.newsMetadata?.date" class="pb-2">
          {{ t('publishedOn') }} {{ dayjs(pageConfig.newsMetadata.date).format('LL') }}
        </v-card-subtitle>

        <!-- Thumbnail (Center Location) -->
        <v-img
          v-if="cardConfig.thumbnail?.show && cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
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
