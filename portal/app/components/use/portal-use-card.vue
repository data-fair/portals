<template>
  <v-card
    :to="`/uses/${use.slug}`"
    class="h-100 d-flex flex-column"
    :elevation="cardConfig.elevation ?? 0"
    :rounded="cardConfig.rounded ?? 'default'"
  >
    <v-row
      class="flex-nowrap"
      no-gutters
    >
      <!-- Image column -->
      <v-col
        v-if="cardConfig.thumbnail?.location === 'left'"
        cols="4"
      >
        <v-img
          v-if="thumbnailUrl"
          :alt="t('imageAlt', { title: use.config.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="h-100"
        />
        <v-divider vertical />
      </v-col>

      <!-- Center column -->
      <v-col class="d-flex flex-column">
        <v-img
          v-if="cardConfig.thumbnail?.location === 'top' && thumbnailUrl"
          :alt="t('imageAlt', { title: use.config.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
        />
        <v-card-title
          class="font-weight-bold"
          style="white-space: unset;"
        >
          {{ use.config.title }}
        </v-card-title>
        <v-img
          v-if="cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
          :alt="t('imageAlt', { title: use.config.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
        />
        <v-card-text
          v-if="cardConfig.showSummary && use.config.summary?.length"
          class="pb-0"
        >
          {{ use.config.summary }}
        </v-card-text>

        <v-spacer />

        <v-list-item v-if="cardConfig.showAuthor && use.config.author">
          <span class="text-caption">
            {{ t('publishedBy', { author: use.config.author }) }}
          </span>
        </v-list-item>

        <v-list-item v-else-if="use.updated">
          <span class="text-caption">
            {{ t('updatedAt') }} {{ dayjs(use.updated.date).format('L') }}
          </span>
        </v-list-item>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Use } from '#api/types/use'
import type { UseCard } from '#api/types/portal-config'
import type { ImageRef } from '#api/types/image-ref/index.ts'

const { use, cardConfig } = defineProps<{
  use: Pick<Use, '_id' | 'slug' | 'config' | 'updated'>
  cardConfig: UseCard
}>()

const { dayjs } = useLocaleDayjs()
const { t } = useI18n()

const getPortalImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/uses/${use.slug}/images/${id}`
}

const getDefaultImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

const thumbnailUrl = computed(() => {
  if (!cardConfig.thumbnail?.show) return undefined
  if (use.config.image) return getPortalImageSrc(use.config.image, false)
  if (cardConfig.thumbnail?.default) return getDefaultImageSrc(cardConfig.thumbnail.default, false)
  return undefined
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
