<template>
  <!--
    link => keeps the ripple, hover styles and pointer cursor while rendering a
    div: the actual link is the overlay below, see card-overlay-link
  -->
  <v-hover v-slot="{ isHovering, props: hoverProps }">
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
        :to="`/reuses/${reuse.slug}`"
        :label="reuse.config.title"
      />

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
          <v-col
            cols="4"
            class="overflow-hidden"
          >
            <template v-if="currentThumbnailUrl">
              <div
                aria-hidden="true"
                :style="[leftThumbnailStyle, hoverFx.imageStyle(isHovering)]"
              />
              <!-- background-image emits no error event, this hidden probe drives the fallback -->
              <img
                :key="currentThumbnailUrl"
                :src="currentThumbnailUrl"
                class="d-none"
                alt=""
                aria-hidden="true"
                @error="onThumbnailError"
              >
            </template>
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
            v-if="cardConfig.thumbnail?.show && (cardConfig.thumbnail?.location === 'top' || (cardConfig.thumbnail?.location === 'left' && $vuetify.display.smAndDown)) && currentThumbnailUrl"
            aria-hidden="true"
            class="flex-grow-0 overflow-hidden"
          >
            <v-img
              :src="currentThumbnailUrl"
              :cover="cardConfig.thumbnail.crop"
              height="170"
              alt=""
              :style="hoverFx.imageStyle(isHovering)"
              @error="onThumbnailError"
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
            v-if="cardConfig.thumbnail?.show && cardConfig.thumbnail?.location === 'center' && currentThumbnailUrl"
            aria-hidden="true"
            class="flex-grow-0 overflow-hidden"
          >
            <v-img
              :src="currentThumbnailUrl"
              :cover="cardConfig.thumbnail.crop"
              height="170"
              alt=""
              :style="hoverFx.imageStyle(isHovering)"
              @error="onThumbnailError"
            />
          </div>

          <v-card-text
            v-if="(cardConfig.showSummary || (cardConfig.thumbnail?.show && cardConfig.thumbnail?.useSummary && !currentThumbnailUrl)) && reuse.config.summary?.length"
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
  </v-hover>
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

const getReuseImageSrc = (imageRef: ImageRef, mobile?: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/reuses/${reuse.slug}/images/${id}`
}

const candidates = computed(() => reuseThumbnailCandidates(
  reuse.config.image,
  cardConfig,
  getReuseImageSrc,
  isPortalConfig ? getPortalImageSrc : getPageImageSrc
))

const { currentThumbnailUrl, onThumbnailError } = useThumbnailFallback(candidates)

// Set thumbnail in background for left location to cover full height of the card
const leftThumbnailStyle = computed(() => {
  if (!currentThumbnailUrl.value) return undefined
  return {
    backgroundImage: `url("${currentThumbnailUrl.value}")`,
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
