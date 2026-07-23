<template>
  <!--
    :to => disabled in preview
    link => simulate link style in preview
  -->
  <v-card
    v-bind="hoverProps"
    :to="!preview ? `/reuses/${reuse.slug}` : undefined "
    :elevation="hoverFx.elevation(isHovering, cardConfig.elevation ?? portalConfig.defaults?.elevation)"
    :color="hoverFx.background(isHovering)"
    :rounded="cardConfig.rounded ?? portalConfig.defaults?.rounded"
    class="h-100 d-flex flex-column"
    :style="hoverFx.rootStyle(isHovering)"
    link
  >
    <!--
      flex-nowrap => prevent columns from wrapping on multiple rows
      no-gutters => remove spaces between columns
    -->
    <v-row
      class="flex-nowrap"
      no-gutters
    >
      <!-- Thumbnail (Left Location) -->
      <!-- On mobile, always use top location -->
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
      <!--
        d-flex flex-column => make the column take full height of the card and arrange content vertically
        min-width: 0 => override default min-width: auto to allow the column to shrink below its content's intrinsic width, enabling text truncation and preventing card overflow
      -->
      <v-col
        class="d-flex flex-column"
        style="min-width: 0"
      >
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
          :title="reuse.config.title"
          :lines-count="cardConfig.titleLinesCount"
          :hover-fx="hoverFx"
          :is-hovering="isHovering"
        />

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

        <v-card-text
          v-if="(cardConfig.showSummary || (cardConfig.thumbnail?.show && cardConfig.thumbnail?.useSummary && !thumbnailUrl)) && reuse.config.summary?.length"
          class="pb-0"
        >
          {{ reuse.config.summary }}
        </v-card-text>

        <v-spacer />

        <!-- Publication/update date -->
        <v-row
          no-gutters
          class="px-4 py-2"
        >
          <v-col cols="12">
            <p
              v-if="cardConfig.showAuthor && reuse.config.author"
              class="text-body-small"
            >
              {{ t('publishedBy', { author: reuse.config.author }) }}
            </p>
            <p class="text-body-small">
              {{ t('updatedAt') }} {{ dayjs(reuse.updatedAt).format('L') }}
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse'
import type { ReuseCard } from '#api/types/portal-config'
import type { ImageRef } from '#api/types/image-ref/index.ts'

const { reuse, cardConfig, isPortalConfig } = defineProps<{
  reuse: Pick<Reuse, '_id' | 'slug' | 'config' | 'updatedAt'>
  cardConfig: ReuseCard
  isPortalConfig?: boolean
}>()

const { dayjs } = useLocaleDayjs()
const { t } = useI18n()
const { portalConfig, preview } = usePortalStore()
const getPageImageSrc = usePageImageSrc()
const getPortalImageSrc = usePortalImageSrc()
const hoverFx = useHoverConfig(() => cardConfig.hover)
const { isHovering, hoverProps } = useHoverState()

const getReuseImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/reuses/${reuse.slug}/images/${id}`
}

const thumbnailUrl = computed(() => {
  if (reuse.config.image) return getReuseImageSrc(reuse.config.image, false)
  if (cardConfig.thumbnail?.default) return (isPortalConfig ? getPortalImageSrc : getPageImageSrc)(cardConfig.thumbnail.default, false)
  return undefined
})

// Set thumbnail in background for left location to cover full height of the card
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
    updatedAt: Updated at
    publishedBy: Published by {author}
  fr:
    updatedAt: Mise à jour le
    publishedBy: Publié par {author}

</i18n>
