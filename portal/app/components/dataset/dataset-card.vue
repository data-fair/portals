<template>
  <v-card
    :to="`/datasets/${isPublished ? dataset.slug : dataset.id}`"
    :title="dataset.title"
    class="h-100 d-flex flex-column"
  >
    <v-img
      v-if="thumbnailUrl"
      :src="thumbnailUrl"
      :cover="portalConfig.datasets.cropThumbnails"
      height="170"
    />
    <v-card-text v-else>
      {{ dataset.description }}
    </v-card-text>

    <template v-if="portalConfig.datasets.actionsStyle !== 'icon'">
      <span class="text-caption ml-4">
        {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
      </span>
      <!-- TODO: show department avatar -->
      <!-- <owner-department :owner="dataset.owner" /> -->
    </template>

    <v-divider />
    <v-card-actions
      class="py-0 cursor-default ga-0"
      style="min-height: auto"
      @click.prevent
    >
      <template v-if="!dataset.isMetaOnly">
        <!-- <table-preview :dataset="dataset" /> -->
        <v-btn
          :to="`/datasets/${isPublished ? dataset.slug : dataset.id}/full`"
          :icon="portalConfig.datasets.actionsStyle === 'icon' ? mdiTableLarge : undefined"
          :prepend-icon="portalConfig.datasets.actionsStyle === 'full' ? mdiTableLarge : undefined"
          :title="portalConfig.datasets.actionsStyle === 'icon' ? t('text.table') : undefined"
          :text="portalConfig.datasets.actionsStyle !== 'icon' ? t('shortText.table') : undefined"
          :density="portalConfig.datasets.actionsStyle === 'icon' ? 'comfortable' : undefined"
          :size="portalConfig.datasets.actionsStyle !== 'icon' ? 'x-small' : undefined"
          variant="text"
        />
      </template>
      <!-- <map-preview v-if="dataset.bbox && dataset.bbox.length" :dataset="dataset" /> -->
      <!-- <v-btn
        v-if="!$vuetify.display.smAndDown && !dataset.isMetaOnly"
        :to="`/datasets/${isPublished ? dataset.slug : dataset.id}/api-doc`"
        :icon="portalConfig.datasets.actionsStyle === 'icon' ? mdiCog : undefined"
        :prepend-icon="portalConfig.datasets.actionsStyle === 'full' ? mdiCog : undefined"
        :title="portalConfig.datasets.actionsStyle === 'icon' ? t('text.api') : undefined"
        :text="portalConfig.datasets.actionsStyle !== 'icon' ? t('shortText.api') : undefined"
        :density="portalConfig.datasets.actionsStyle === 'icon' ? 'comfortable' : undefined"
        :size="portalConfig.datasets.actionsStyle !== 'icon' ? 'x-small' : undefined"
        variant="text"
      /> -->

      <template v-if="portalConfig.datasets.actionsStyle === 'icon'">
        <v-spacer />
        <span class="text-caption">
          {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
        </span>
        <!-- TODO: show department avatar -->
        <!-- <owner-department :owner="dataset.owner" /> -->
      </template>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { mdiTableLarge } from '@mdi/js'

const { dataset } = defineProps<{
  dataset: {
    id: string
    slug: string
    title: string
    description: string
    dataUpdatedAt: string
    updatedAt: string
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

const isPublished = ref(false) // TODO: get if dataset is published

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
