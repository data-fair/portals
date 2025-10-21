<template>
  <v-card
    :to="`/datasets/${dataset.slug}`"
    class="h-100 d-flex flex-column"
  >
    <v-row
      class="flex-nowrap"
      no-gutters
    >
      <!-- Image column -->
      <v-col
        v-if="cardConfig.thumbnailLocation === 'left'"
        cols="4"
      >
        <v-img
          v-if="thumbnailUrl"
          :alt="t('imageAlt', { title: dataset.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.cropThumbnails"
          class="h-100"
        />
        <v-divider vertical />
      </v-col>

      <!-- Center column -->
      <v-col class="d-flex flex-column">
        <v-card-title>{{ dataset.title }}</v-card-title>
        <v-img
          v-if="cardConfig.thumbnailLocation === 'center' && thumbnailUrl"
          :alt="t('imageAlt', { title: dataset.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.cropThumbnails"
          height="170"
        />
        <v-card-text
          v-if="cardConfig.showSummary && dataset.summary?.length"
          class="pb-0"
        >
          {{ dataset.summary }}
        </v-card-text>

        <v-spacer />
        <v-list-item>
          <template #prepend>
            <owner-avatar
              v-if="dataset.owner.department && cardConfig.showDepartment"
              :owner="dataset.owner"
            />
          </template>
          <span :class="['text-caption', dataset.owner.department && cardConfig.showDepartment ? 'ml-2' : '']">
            {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
          </span>
        </v-list-item>

        <!-- Actions (Bottom Location) -->
        <template v-if="(cardConfig.actionsLocation === 'bottom' && !dataset.isMetaOnly) || $vuetify.display.smAndDown">
          <v-divider />
          <v-card-actions
            class="py-2 ga-0 cursor-default"
            style="min-height: auto"
            @click.prevent
          >
            <dataset-table-preview
              :dataset="dataset"
              :action-style="cardConfig.actionsStyle"
            />
            <action-btn
              :to="`/datasets/${dataset.slug}/full`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiTableLarge"
              :text="t('text.table')"
              :short-text="t('shortText.table')"
            />
            <dataset-map-preview
              v-if="dataset.bbox?.length"
              :dataset="dataset"
              :action-style="cardConfig.actionsStyle"
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
          <dataset-table-preview
            :dataset="dataset"
            :action-style="cardConfig.actionsStyle"
          />
          <action-btn
            :to="`/datasets/${dataset.slug}/full`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiTableLarge"
            :text="t('text.table')"
            :short-text="t('shortText.table')"
          />
          <dataset-map-preview
            v-if="dataset.bbox?.length"
            :dataset="dataset"
            :action-style="cardConfig.actionsStyle"
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
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiCog, mdiTableLarge } from '@mdi/js'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { dataset, cardConfig } = defineProps<{
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
    topics: { id: string; title: string }[]
    image?: string
    isMetaOnly: boolean
  },
  cardConfig: DatasetCard
}>()

const { dayjs } = useLocaleDayjs()
const { t } = useI18n()

const thumbnailUrl = computed(() => {
  if (dataset.image) return dataset.image
  if (cardConfig.useApplicationThumbnail && dataset.extras?.applications?.[0]) {
    return `/data-fair/api/v1/applications/${dataset.extras.applications[0].id}/capture?updatedAt=${dataset.extras.applications[0].updatedAt}`
  }
  return undefined
})

</script>

<i18n lang="yaml">
  en:
    imageAlt: 'Thumbnail image for {title}'
    updatedAt: Updated at
    text:
      table: Full table
      api: API documentation
    shortText:
      table: Table
      api: API
  fr:
    imageAlt: 'Image de couverture pour le jeu de données {title}'
    updatedAt: Mis à jour le
    text:
      table: Tableau plein écran
      api: Documentation d'API
    shortText:
      table: Tableau
      api: API
</i18n>
