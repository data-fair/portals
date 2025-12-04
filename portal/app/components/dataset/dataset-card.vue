<template>
  <v-card
    :to="`/datasets/${dataset.slug}`"
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
        cols="12"
        sm="4"
      >
        <v-img
          v-if="thumbnailUrl"
          :alt="t('imageAlt', { title: dataset.title })"
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
          :alt="t('imageAlt', { title: dataset.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
        />
        <v-card-title
          class="font-weight-bold"
          style="white-space: unset;"
        >
          {{ dataset.title }}
        </v-card-title>
        <v-img
          v-if="cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
          :alt="t('imageAlt', { title: dataset.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
        />
        <v-card-text
          v-if="cardConfig.showSummary && dataset.summary?.length"
          class="pb-0"
        >
          {{ dataset.summary }}
        </v-card-text>

        <v-spacer />

        <!-- Topics List -->
        <topics-list
          v-if="cardConfig.topics?.show && dataset.topics?.length"
          :config="cardConfig.topics"
          :topics="dataset.topics"
          class="mx-4 mt-2 flex-grow-0"
        />

        <!-- keywords list -->
        <keywords-list
          v-if="cardConfig.keywords?.show && dataset.keywords?.length"
          :config="cardConfig.keywords"
          :keywords="dataset.keywords"
          class="px-4 mt-2 flex-grow-0"
        />

        <!-- Department / Updated At -->
        <v-list-item>
          <template #prepend>
            <owner-avatar
              v-if="dataset.owner.department && cardConfig.showDepartment"
              :owner="dataset.owner"
            />
          </template>
          <!-- <span :class="['text-caption', dataset.owner.department && cardConfig.showDepartment ? 'ml-2' : '']">
            {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
          </span> -->
        </v-list-item>

        <!-- Actions (Bottom Location) -->
        <template v-if="(cardConfig.actionsLocation === 'bottom' && !dataset.isMetaOnly) || $vuetify.display.smAndDown">
          <v-divider />
          <v-card-actions
            class="py-2 ga-0 cursor-default"
            style="min-height: auto"
            @click.prevent
          >
            <action-btn
              :to="`/datasets/${dataset.slug}/table`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiTableLarge"
              :text="t('text.table')"
            />
            <action-btn
              v-if="dataset.bbox?.length"
              :to="`/datasets/${dataset.slug}/map`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiMapMarker"
              :text="t('text.map')"
            />
            <action-btn
              :to="`/datasets/${dataset.slug}/api-doc`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiCog"
              :text="t('text.api')"
              :short-text="t('shortText.api')"
            />
          </v-card-actions>
        </template>
      </v-col>

      <!-- Actions (Right Location) -->
      <template v-if="cardConfig.actionsLocation === 'right' && !$vuetify.display.smAndDown">
        <v-divider vertical />
        <v-col
          cols="auto"
          class="pa-2 cursor-default d-flex flex-column ga-2"
          @click.prevent
        >
          <action-btn
            :to="`/datasets/${dataset.slug}/table`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiTableLarge"
            :text="t('text.table')"
          />
          <action-btn
            v-if="dataset.bbox?.length"
            :to="`/datasets/${dataset.slug}/map`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiMapMarker"
            :text="t('text.map')"
          />
          <action-btn
            :to="`/datasets/${dataset.slug}/api-doc`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiCog"
            :text="t('text.api')"
            :short-text="t('shortText.api')"
          />
        </v-col>
      </template>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiCog, mdiMapMarker, mdiTableLarge } from '@mdi/js'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { dataset, cardConfig, isPortalConfig } = defineProps<{
  dataset: {
    id: string
    slug: string
    title: string
    summary?: string
    dataUpdatedAt: string
    updatedAt: string
    owner: Account
    extras: {
      applications?: { id: string; updatedAt: string }[]
    }
    bbox?: number[]
    topics: { id: string; title: string; color: string }[]
    keywords?: string[]
    image?: string
    isMetaOnly: boolean
  },
  cardConfig: DatasetCard
  isPortalConfig?: boolean
}>()

// const { dayjs } = useLocaleDayjs()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const getPageImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const getPortalImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

const thumbnailUrl = computed(() => {
  if (!cardConfig.thumbnail?.show) return undefined
  if (dataset.image) return dataset.image
  if (cardConfig.thumbnail.useTopic && dataset.topics?.[0]?.id) {
    const topicConfig = portalConfig.value.topics?.find((t) => t.id === dataset.topics[0]!.id)
    if (topicConfig?.thumbnail) return getPortalImageSrc(topicConfig.thumbnail, false)
  }
  if (cardConfig.thumbnail.useApplication && dataset.extras?.applications?.[0]) {
    return `/data-fair/api/v1/applications/${dataset.extras.applications[0].id}/capture?updatedAt=${dataset.extras.applications[0].updatedAt}`
  }
  if (cardConfig.thumbnail?.default) return (isPortalConfig ? getPortalImageSrc : getPageImageSrc)(cardConfig.thumbnail.default, false)
  return undefined
})

</script>

<i18n lang="yaml">
  en:
    imageAlt: 'Thumbnail image for {title}'
    updatedAt: Updated at
    text:
      table: Table
      map: Map
      api: API documentation
    shortText:
      api: API

  fr:
    imageAlt: 'Image de couverture pour le jeu de données {title}'
    updatedAt: Mis à jour le
    text:
      table: Tableau
      map: Carte
      api: Documentation d'API
    shortText:
      api: API

</i18n>
