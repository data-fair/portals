<template>
  <v-card>
    <!-- Dataset Metadata -->
    <v-row class="ma-0">
      <!--
        All fields are wrapped in v-cols for responsive grid layout
        that adapts to screen size and metadataLocation setting
        (full width or single column)
      -->

      <!-- Records count / Size -->
      <v-col v-bind="metadataColProps">
        <div class="text-caption text-medium-emphasis">{{ t('size') }}</div>
        {{ t('records', dataset.count || 0) }} {{ dataset.storage?.indexed?.size ? ' - ' +
        formatBytes(dataset.storage.indexed.size) : '' }}
      </v-col>

      <!-- Origin (Link to source or producer label) -->
      <v-col
        v-if="dataset.origin"
        v-bind="metadataColProps"
      >
        <template v-if="dataset.origin.startsWith('http://') || dataset.origin.startsWith('https://')">
          {{ t('dataFrom') }}
          <a
            :href="dataset.origin"
            rel="noopener"
            target="_blank"
            class="simple-link"
          >
            {{ t('thisSource') }}
          </a>
        </template>
        <template v-else>
          <div class="text-caption text-medium-emphasis">{{ t('dataProducedBy') }}</div>
          {{ dataset.origin }}
        </template>
      </v-col>

      <!-- Owner -->
      <v-col
        v-if="dataset.owner.department && portalConfig.datasets.page.showDepartment"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis">{{ t('owner') }}</div>
        <div class="d-flex align-center ga-2">
          <v-avatar
            :image="avatarUrl"
            :title="dataset.owner.departmentName || dataset.owner.department || dataset.owner.name"
            :size="28"
          />
          {{ dataset.owner.departmentName || dataset.owner.department || dataset.owner.name }}
        </div>
      </v-col>

      <v-col
        v-if="dataset.license"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis"> {{ t('license') }}</div>
        <a
          :href="dataset.license.href"
          rel="noopener"
          target="_blank"
          class="simple-link"
        >
          {{ dataset.license.title }}
        </a>
      </v-col>

      <v-col
        v-if="dataset.keywords?.length"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis"> {{ t('keywords') }}</div>
        <v-chip
          v-for="(keyword,i) in dataset.keywords"
          :key="i"
          :text="keyword"
          color="secondary"
          size="small"
          class="ma-1"
        />
      </v-col>

      <v-col
        v-if="dataset.spatial"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis"> {{ t('spatialCoverage') }}</div>
        {{ dataset.spatial }}
      </v-col>

      <v-col
        v-if="dataset.temporal?.start"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis"> {{ t('temporalCoverage') }}</div>
        <template v-if="dataset.temporal.end">
          {{ dayjs(dataset.temporal.start).format('LL') }} - {{ dayjs(dataset.temporal.end).format('LL') }}
        </template>
        <template v-else>
          {{ t('temporalStart') }} {{ dayjs(dataset.temporal.start).format('LL') }}
        </template>
      </v-col>

      <v-col
        v-if="dataset.frequency"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis"> {{ t('updateFrequency') }}</div>
        {{ t('frequency.' + dataset.frequency) }}
      </v-col>

      <v-col
        v-if="portalConfig.datasets.page.attachmentsLocation === 'full' && dataset.attachments?.filter(a => a.url !== dataset!.image).length"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis"> {{ t('attachments') }}</div>
        <dataset-attachments :dataset="dataset" />
      </v-col>
    </v-row>

    <v-divider />

    <!-- Actions, update date and share -->
    <v-row
      class="ma-0"
      align="center"
    >
      <v-col v-bind="metadataColProps">
        <template v-if="!dataset.isMetaOnly">
          <dataset-table-preview
            v-if="!$vuetify.display.smAndDown"
            :dataset="dataset"
            :action-style="portalConfig.datasets.page.actionsStyle"
          />
          <action-btn
            :to="`/datasets/${dataset.slug}/full`"
            :action-style="portalConfig.datasets.page.actionsStyle"
            :icon="mdiTableLarge"
            :text="t('text.table')"
            :short-text="t('shortText.table')"
          />
          <dataset-map-preview
            v-if="!$vuetify.display.smAndDown && dataset.bbox?.length"
            :dataset="dataset"
            :action-style="portalConfig.datasets.page.actionsStyle"
          />
          <action-btn
            v-if="!$vuetify.display.smAndDown"
            :to="`/datasets/${dataset.slug}/api-doc`"
            :action-style="portalConfig.datasets.page.actionsStyle"
            :icon="mdiCog"
            :text="t('text.api')"
            :short-text="t('shortText.api')"
          />

          <dataset-download :dataset="dataset" />
          <dataset-schema :dataset="dataset" />
          <dataset-embed :dataset="dataset" />
        </template>

        <dataset-attachments-preview
          v-if="portalConfig.datasets.page.attachmentsLocation === 'action' && dataset.attachments?.filter(a => a.url !== dataset!.image).length"
          :dataset="dataset"
        />
        <dataset-notifications
          v-if="portalConfig.authentication !== 'none'"
          :dataset="dataset"
        />
      </v-col>

      <v-col v-bind="metadataColProps">
        {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('LL') }}
      </v-col>

      <ClientOnly>
        <v-col v-if="dataset.public">
          {{ t('share') }}
          <social-share :title="dataset.title" />
        </v-col>
      </ClientOnly>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiCog, mdiTableLarge } from '@mdi/js'
import formatBytes from '@data-fair/lib-vue/format/bytes.js'

type Dataset = {
  id: string
  slug: string
  title: string
  summary?: string
  description?: string
  dataUpdatedAt: string
  updatedAt: string
  owner: Account
  count?: number
  storage?: {
    indexed?: {
      size?: number
    }
  }
  origin?: string
  license?: {
    title: string
    href: string
  }
  keywords?: string[]
  spatial?: string
  temporal?: {
    start: string
    end?: string
  }
  frequency?: string
  attachments: {
    url: string
    title: string
    name: string
    type: 'file' | 'remoteFile'
    description: string
    size: string
    updatedAt: string
  }[]
  image?: string
  thumbnail?: string
  isMetaOnly: boolean
  isRest: boolean
  isVirtual: boolean
  extras: {
    applications?: { id: string; slug: string; updatedAt: string }[]
  }
  bbox?: number[]
  public: boolean
  userPermissions: string[]
  previews: {
    id: string
    title: string
    href: string
  }[]
}

const { dataset } = defineProps<{ dataset: Dataset }>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()
const { dayjs } = useLocaleDayjs()

const metadataColProps = computed(() => ({
  class: 'py-0 my-2',
  cols: 12,
  md: portalConfig.value.datasets.page.metadataLocation !== 'right' ? 4 : 12
}))

const avatarUrl = computed(() => {
  if (dataset.owner.department) return `/simple-directory/api/avatars/${dataset.owner.type}/${dataset.owner.id}/${dataset.owner.department}/avatar.png`
  else return `/simple-directory/api/avatars/${dataset.owner.type}/${dataset.owner.id}/avatar.png`
})

</script>

<i18n lang="yaml">
  en:
    attachments: 'Attachments:'
    dataFrom: 'Data from'
    dataProducedBy: 'Data produced by:'
    records: '{count} record | {count} records'
    frequency:
      annual: 'Every year'
      biennial: 'Every 2 years'
      bimonthly: 'Every 2 months'
      biweekly: 'Every 2 weeks'
      continuous: 'Continuously'
      daily: 'Every day'
      irregular: 'Irregular'
      monthly: 'Every month'
      quarterly: 'Every quarter'
      semiannual: '2 times a year'
      semimonthly: '2 times a month'
      semiweekly: '2 times a week'
      threeTimesAMonth: '3 times a month'
      threeTimesAWeek: '3 times a week'
      threeTimesAYear: '3 times a year'
      triennial: 'Every 3 years'
      weekly: 'Every week'
    keywords: 'Keywords:'
    license: 'License:'
    owner: 'Owner:'
    share: 'Share:'
    shortText:
      api: API
      table: Table
    size: 'Size:'
    spatialCoverage: 'Spatial coverage:'
    temporalCoverage: 'Temporal coverage:'
    temporalStart: 'From'
    text:
      api: API documentation
      table: Full table
    thisSource: 'this source'
    updateFrequency: 'Update frequency:'
    updatedAt: Updated at
  fr:
    attachments: 'Pièces jointes :'
    dataFrom: 'Données issues de'
    dataProducedBy: 'Données produites par :'
    records: '{count} enregistrement | {count} enregistrements'
    frequency:
      annual: 'Tous les ans'
      biennial: 'Tous les 2 ans'
      bimonthly: 'Tous les 2 mois'
      biweekly: 'Toutes les 2 semaines'
      continuous: 'En continu'
      daily: 'Tous les jours'
      irregular: 'Irrégulier'
      monthly: 'Tous les mois'
      quarterly: 'Chaque trimestre'
      semiannual: '2 fois par an'
      semimonthly: '2 fois par mois'
      semiweekly: '2 fois par semaine'
      threeTimesAMonth: '3 fois par mois'
      threeTimesAWeek: '3 fois par semaine'
      threeTimesAYear: '3 fois par an'
      triennial: 'Tous les 3 ans'
      weekly: 'Chaque semaine'
    keywords: 'Mots-clés :'
    license: 'Licence :'
    owner: 'Propriétaire :'
    share: 'Partager :'
    shortText:
      api: API
      table: Tableau
    size: 'Taille :'
    spatialCoverage: 'Couverture géographique :'
    temporalCoverage: 'Couverture temporelle :'
    temporalStart: 'À partir de'
    text:
      api: Documentation d'API
      table: Tableau plein écran
    thisSource: 'cette source'
    updateFrequency: 'Fréquence de mise à jour :'
    updatedAt: Mis à jour le
</i18n>
