<template>
  <v-card
    :to="`/datasets/${dataset.slug}`"
    class="h-100 d-flex flex-column"
  >
    <!-- Vertical layout -->
    <template v-if="portalConfig.datasets.cardsLayout !== 'horizontal' || $vuetify.display.xs">
      <v-card-title>{{ dataset.title }}</v-card-title>

      <v-img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :cover="portalConfig.datasets.cropThumbnails"
        height="170"
      />
      <v-card-text v-else>{{ dataset.description }}</v-card-text>

      <v-list-item v-if="portalConfig.datasets.actionsStyle !== 'icon'">
        <owner-avatar :owner="dataset.owner" />
        <span class="text-caption ml-2">
          {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
        </span>
      </v-list-item>

      <v-divider />
      <v-card-actions
        class="py-2 ga-0 cursor-default"
        style="min-height: auto"
        @click.prevent
      >
        <template v-if="portalConfig.datasets.showActions && !dataset.isMetaOnly && !$vuetify.display.smAndDown">
          <dataset-table-preview :dataset="dataset" />
          <action-btn
            :to="`/datasets/${dataset.slug}/full`"
            :icon="mdiTableLarge"
            :text="t('text.table')"
            :short-text="t('shortText.table')"
          />
          <dataset-map-preview v-if="dataset.bbox?.length" :dataset="dataset" />
          <action-btn
            :to="`/datasets/${dataset.slug}/api-doc`"
            :icon="mdiCog"
            :text="t('text.api')"
            :short-text="t('shortText.api')"
          />
        </template>

        <template v-if="portalConfig.datasets.actionsStyle === 'icon'">
          <v-spacer />
          <span class="text-caption mr-2">
            {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
          </span>
          <owner-avatar :owner="dataset.owner" />
        </template>
      </v-card-actions>
    </template>

    <!-- Horizontal layout -->
    <v-row
      v-else
      style="height:246px;"
      no-gutters
    >
      <v-col cols="4">
        <v-img
          v-if="thumbnailUrl"
          :src="thumbnailUrl"
          :cover="portalConfig.datasets.cropThumbnails"
          class="h-100"
        />
      </v-col>
      <v-divider vertical />
      <v-col class="d-flex flex-column">
        <v-card-title>{{ dataset.title }}</v-card-title>
        <v-card-text>{{ dataset.description }}</v-card-text>

        <v-spacer />
        <v-divider />
        <v-card-actions
          class="py-2 ga-0 cursor-default"
          style="min-height: auto"
          @click.prevent
        >
          <template v-if="portalConfig.datasets.showActions && !dataset.isMetaOnly && !$vuetify.display.smAndDown">
            <dataset-table-preview :dataset="dataset" />
            <action-btn
              :to="`/datasets/${dataset.slug}/full`"
              :icon="mdiTableLarge"
              :text="t('text.table')"
              :short-text="t('shortText.table')"
            />
            <dataset-map-preview v-if="dataset.bbox?.length" :dataset="dataset" />
            <action-btn
              :to="`/datasets/${dataset.slug}/api-doc`"
              :icon="mdiCog"
              :text="t('text.api')"
              :short-text="t('shortText.api')"
            />
          </template>

          <v-spacer />
          <span class="text-caption mr-2">
            {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
          </span>
          <owner-avatar :owner="dataset.owner" />
        </v-card-actions>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiCog, mdiTableLarge } from '@mdi/js'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { dataset } = defineProps<{
  dataset: {
    id: string
    slug: string
    title: string
    description: string
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
  }
}>()

const { dayjs } = useLocaleDayjs()
const { t } = useI18n()
const { portalConfig } = usePortalStore()

const thumbnailUrl = computed(() => {
  if (dataset.image) return dataset.image
  if (portalConfig.value.datasets.useApplicationThumbnail && dataset.extras?.applications?.[0]) {
    return `/data-fair/api/v1/applications/${dataset.extras.applications[0].id}/capture?updatedAt=${dataset.extras.applications[0].updatedAt}`
  }
  return undefined
})

</script>

<i18n lang="yaml">
  en:
    updatedAt: Updated at
    text:
      table: Full table
      api: API documentation
    shortText:
      table: Table
      api: API
  fr:
    updatedAt: Mis à jour le
    text:
      table: Tableau plein écran
      api: Documentation d'API
    shortText:
      table: Tableau
      api: API
</i18n>
