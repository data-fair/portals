<template>
  <v-card
    :to="`/reuses/${reuse.slug}`"
    class="h-100 d-flex flex-column"
    :elevation="cardConfig.elevation ?? 0"
    :rounded="cardConfig.rounded ?? 'default'"
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
      <template v-if="cardConfig.thumbnail?.location === 'left' && !$vuetify.display.smAndDown">
        <v-col cols="4">
          <div
            v-if="thumbnailUrl"
            role="img"
            :aria-label="t('imageAlt', { title: reuse.config.title })"
            :style="leftThumbnailStyle"
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
        <v-img
          v-if="cardConfig.thumbnail && (cardConfig.thumbnail?.location === 'top' || $vuetify.display.smAndDown) && thumbnailUrl"
          :alt="t('imageAlt', { title: reuse.config.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
        />

        <!--
          title-two-lines and 'height': titleHeight=> truncate title to 2 lines
          white-space: unset; => remove default nowrap from v-card-title
        -->
        <v-card-title
          :class="['font-weight-bold', { 'title-two-lines': cardConfig.titleLinesCount === 2 }]"
          :style="[
            cardConfig.titleLinesCount !== 1 ? { 'white-space': 'unset' } : {},
            cardConfig.titleLinesCount === 2 ? { 'height': titleHeight } : {}
          ]"
        >
          {{ reuse.config.title }}
        </v-card-title>

        <!-- Thumbnail (Center Location) -->
        <v-img
          v-if="cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
          :alt="t('imageAlt', { title: reuse.config.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
        />

        <v-card-text
          v-if="cardConfig.showSummary && reuse.config.summary?.length"
          class="pb-0"
        >
          {{ reuse.config.summary }}
        </v-card-text>

        <v-spacer />

        <v-list-item>
          <p
            v-if="cardConfig.showAuthor && reuse.config.author"
            class="text-caption"
          >
            {{ t('publishedBy', { author: reuse.config.author }) }}
          </p>
          <p class="text-caption">
            {{ t('updatedAt') }} {{ dayjs(reuse.updatedAt).format('L') }}
          </p>
        </v-list-item>
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

const getPageImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const getReuseImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/reuses/${reuse.slug}/images/${id}`
}

const getPortalImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

const thumbnailUrl = computed(() => {
  if (!cardConfig.thumbnail?.show) return undefined
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

// Height calculation for title with 2 lines
const titleHeight = ref<string>()
onMounted(() => {
  const titleElement = document.querySelector('.title-two-lines')
  if (titleElement) {
    const styles = getComputedStyle(titleElement)
    const lineHeight = parseFloat(styles.lineHeight)
    const paddingTop = parseFloat(styles.paddingTop)
    const paddingBottom = parseFloat(styles.paddingBottom)
    titleHeight.value = `${lineHeight * 2 + paddingTop + paddingBottom}px`
  }
})

</script>

<i18n lang="yaml">
  en:
    imageAlt: 'Thumbnail image for {title}'
    updatedAt: Updated at
    publishedBy: Published by {author}
  fr:
    imageAlt: 'Image de couverture pour la réutilisation {title}'
    updatedAt: Mise à jour le
    publishedBy: Publié par {author}

</i18n>

<style scoped>
.title-two-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
