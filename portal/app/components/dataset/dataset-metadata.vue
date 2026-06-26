<template>
  <v-card
    :rounded="metadataConfig.rounded ?? portalConfig.defaults?.rounded"
    :elevation="metadataConfig.elevation ?? portalConfig.defaults?.elevation"
  >
    <!-- Dataset Metadata -->
    <v-row
      class="px-3 py-2"
      density="compact"
    >
      <!--
        All fields are wrapped in v-cols for responsive grid layout
        that adapts to screen size and metadata.location setting
        (full width or single column)
      -->

      <!-- Records count / Size -->
      <v-col v-bind="metadataColProps">
        <div class="text-body-small text-medium-emphasis">{{ t('size') }}</div>
        {{ t('records', { count: (dataset.count || 0), formatted: (dataset.count || 0).toLocaleString('fr') }) }} {{ dataset.storage?.indexed?.size ? ' - ' +
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
            :title="t('thisSource') + ' - ' + t('newWindow')"
            class="simple-link"
          >
            {{ t('thisSource') }}
          </a>
        </template>
        <template v-else>
          <div class="text-body-small text-medium-emphasis">{{ t('dataProducedBy') }}</div>
          {{ dataset.origin }}
        </template>
      </v-col>

      <!-- Owner -->
      <v-col
        v-if="metadataConfig.showDepartment"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ customOwnerLabel ? t('ownerOverride', { owner: customOwnerLabel }) : t('owner') }}</div>
        <div class="d-flex align-center ga-2">
          <owner-avatar
            :owner="dataset.owner"
            :show-tooltip="false"
            aria-hidden="true"
          />
          {{ dataset.owner.departmentName || dataset.owner.department || dataset.owner.name }}
        </div>
      </v-col>

      <!-- Creator -->
      <v-col
        v-if="dataset.creator"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ metadataLabel('creator') }}</div>
        <div class="d-flex align-center ga-2">
          {{ dataset.creator }}
        </div>
      </v-col>

      <v-col
        v-if="dataset.license"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ t('license') }}</div>
        <a
          :href="dataset.license.href"
          rel="noopener"
          target="_blank"
          :title="dataset.license.title + ' - ' + t('newWindow')"
          class="simple-link"
        >
          {{ dataset.license.title }}
        </a>
      </v-col>

      <v-col
        v-if="topicsConfig?.show && dataset.topics?.length"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ t('topics') }}</div>
        <topics-list
          :topics="dataset.topics"
          :config="topicsConfig"
        />
      </v-col>

      <v-col
        v-if="keywordsConfig?.show && dataset.keywords?.length"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ metadataLabel('keywords') }}</div>
        <keywords-list
          :keywords="dataset.keywords"
          :config="keywordsConfig"
        />
      </v-col>

      <!-- Custom metadata -->
      <v-col
        v-for="customMeta in metadataSettings.data.value?.custom?.filter(cm => dataset.customMetadata?.[cm.key])"
        :key="customMeta.key"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ customMeta.title || customMeta.key }}</div>
        <div>{{ dataset.customMetadata?.[customMeta.key] }}</div>
      </v-col>

      <v-col
        v-if="formattedSpatial"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ metadataLabel('spatial') }}</div>
        {{ formattedSpatial }}
      </v-col>

      <v-col
        v-if="dataset.temporal?.start"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ metadataLabel('temporal') }}</div>
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
        <div class="text-body-small text-medium-emphasis">{{ metadataLabel('frequency') }}</div>
        {{ t('frequencyLabels.' + dataset.frequency) }}
      </v-col>

      <v-col
        v-if="dataset.conformsTo && (dataset.conformsTo.title || dataset.conformsTo.url || dataset.conformsTo.version)"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ metadataLabel('conformsTo') }}</div>
        <div class="d-flex align-center ga-2 flex-wrap">
          <a
            v-if="dataset.conformsTo.url"
            :href="dataset.conformsTo.url"
            rel="noopener"
            target="_blank"
            :title="(dataset.conformsTo.title || dataset.conformsTo.url) + ' - ' + t('newWindow')"
            class="simple-link"
          >
            {{ dataset.conformsTo.title || dataset.conformsTo.url }}
          </a>
          <template v-else-if="dataset.conformsTo.title">
            {{ dataset.conformsTo.title }}
          </template>
          <v-chip
            v-if="dataset.conformsTo.version"
            :text="dataset.conformsTo.version"
            :prepend-icon="mdiLabel"
            size="small"
          />
        </div>
      </v-col>

      <!-- Last update date -->
      <v-col v-bind="metadataColProps">
        <div class="text-body-small text-medium-emphasis">{{ dataset.modified || dataset.dataUpdatedAt ? metadataLabel('modified') : t('lastUpdate') }}</div>
        <div class="d-flex align-center ga-2">
          {{ dayjs(dataset.modified || dataset.dataUpdatedAt || dataset.updatedAt).format('LL') }}
        </div>
      </v-col>

      <v-col
        v-if="metadataConfig.showAttachments && dataset.attachments?.filter(a => a.url !== dataset!.image).length"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ t('attachments') }}</div>
        <dataset-attachments :dataset="dataset" />
      </v-col>

      <ClientOnly>
        <v-col
          v-if="dataset.public && metadataConfig.location !== 'right'"
          v-bind="metadataColProps"
        >
          <div class="text-body-small text-medium-emphasis">{{ t('share') }}</div>
          <social-share :title="dataset.title" />
        </v-col>
      </ClientOnly>
    </v-row>

    <v-divider />

    <!-- Actions, update date and share -->
    <v-row
      density="compact"
      class="align-center px-3 py-2"
    >
      <v-col cols="12">
        <template v-if="!dataset.isMetaOnly">
          <action-btn
            v-if="shouldShowActionButton('table')"
            :to="{
              path: `/datasets/${dataset.slug}/table`,
              query: $route.query
            }"
            :action-style="metadataConfig.actionsStyle"
            :icon="mdiTableLarge"
            :resource-title="dataset.title"
            :text="t('text.table')"
            :tooltip="t('tooltip.table')"
          />
          <action-btn
            v-if="dataset.bbox?.length && shouldShowActionButton('map')"
            :to="`/datasets/${dataset.slug}/map`"
            :action-style="metadataConfig.actionsStyle"
            :icon="mdiMapMarker"
            :resource-title="dataset.title"
            :text="t('text.map')"
            :tooltip="t('tooltip.map')"
          />
          <action-btn
            v-if="!$vuetify.display.smAndDown && shouldShowActionButton('api')"
            :to="`/datasets/${dataset.slug}/api-doc`"
            :action-style="metadataConfig.actionsStyle"
            :icon="mdiCog"
            :resource-title="dataset.title"
            :text="t('text.api')"
            :tooltip="t('tooltip.api')"
          />

          <dataset-download
            v-if="shouldShowActionButton('download')"
            :dataset="dataset"
          />
          <dataset-schema
            v-if="shouldShowActionButton('schema')"
            :dataset="dataset"
          />
          <dataset-embed
            v-if="!$vuetify.display.smAndDown && shouldShowActionButton('embed') && dataset.previews?.length"
            :dataset="dataset"
          />
        </template>

        <dataset-attachments-preview
          v-if="shouldShowActionButton('attachments') && dataset.attachments?.filter(a => a.url !== dataset.image).length"
          :dataset="dataset"
        />
        <dataset-notifications
          v-if="portalConfig.authentication !== 'none' && shouldShowActionButton('notifications')"
          :dataset="dataset"
        />
        <edit-resource-btn
          kind="dataset"
          :resource="dataset"
          :action-style="metadataConfig.actionsStyle"
        />
      </v-col>

      <!-- <v-col v-bind="metadataColProps">
        {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('LL') }}
      </v-col> -->

      <ClientOnly>
        <v-col v-if="dataset.public && metadataConfig.location === 'right'">
          {{ t('share') }}
          <social-share :title="dataset.title" />
        </v-col>
      </ClientOnly>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import type { ActionButtons } from '#api/types/portal-config'
import { mdiCog, mdiLabel, mdiMapMarker, mdiTableLarge } from '@mdi/js'
import OwnerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'
import formatBytes from '@data-fair/lib-vue/format/bytes.js'

const { dataset } = defineProps<{ dataset: Dataset }>()
const { portalConfig } = usePortalStore()
const { t, locale } = useI18n()
const { dayjs } = useLocaleDayjs()

const metadataConfig = computed(() => portalConfig.value.datasets.page.metadata || {})
const topicsConfig = computed(() => portalConfig.value.datasets.page.topics)
const keywordsConfig = computed(() => portalConfig.value.datasets.page.keywords)
const metadataColProps = computed(() => ({
  class: 'py-0',
  cols: 12,
  md: metadataConfig.value.location !== 'right' ? 4 : 12
}))

const formattedSpatial = computed(() => {
  const spatial = dataset.spatial
  if (!spatial) return ''

  const parts = spatial.split(';').map(part => part.trim()).filter(Boolean)
  if (!parts.length) return spatial
  if (parts.length === 1) return parts[0]

  return new Intl.ListFormat(locale.value, { style: 'long', type: 'conjunction' }).format(parts)
})

const customOwnerLabel = portalConfig.value.labelsOverrides?.owner

const shouldShowActionButton = (button: ActionButtons[number]) => metadataConfig.value.actionButtons?.includes(button)

type BaseMetadataSettings = Partial<Record<'keywords' | 'frequency' | 'temporal' | 'spatial' | 'modified' | 'creator' | 'conformsTo',
  { active?: boolean; title?: string }
>>

type MetadataSettings = BaseMetadataSettings & { custom?: { key: string; title?: string }[] }
const metadataSettings = useLocalFetch<MetadataSettings>('/data-fair/api/v1/datasets/' + dataset.id + '/metadata-settings')
const metadataLabel = (key: keyof BaseMetadataSettings) => metadataSettings.data.value?.[key]?.title || t(key)

</script>

<i18n lang="yaml">
  en:
    attachments: 'Attachments:'
    creator: 'Creator:'
    dataFrom: 'Data from'
    dataProducedBy: 'Data produced by:'
    records: '0 record | {formatted} record | {formatted} records'
    frequencyLabels:
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
    conformsTo: 'Schema:'
    keywords: 'Keywords:'
    lastUpdate: 'Last update:'
    license: 'License:'
    modified: 'Data last modified:'
    newWindow: 'New window'
    owner: 'Owner:'
    ownerOverride: '{owner}:'
    share: 'Share:'
    size: 'Size:'
    spatial: 'Spatial coverage:'
    temporal: 'Temporal coverage:'
    temporalStart: 'From'
    text:
      api: API
      map: Map
      table: Table
    tooltip:
      map: Open the map view in full page
      table: Open the table view in full page
      api: Open the API documentation in full page
    thisSource: 'this source'
    frequency: 'Update frequency:'
    topics: 'Topics:'
    updatedAt: Updated at
  fr:
    attachments: 'Pièces jointes :'
    creator: 'Producteur :'
    dataFrom: 'Données issues de'
    dataProducedBy: 'Provenance des données :'
    records: '0 enregistrement | {formatted} enregistrement | {formatted} enregistrements'
    frequencyLabels:
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
    conformsTo: 'Schéma :'
    keywords: 'Mots-clés :'
    lastUpdate: 'Dernière mise à jour :'
    license: 'Licence :'
    modified: 'Dernière mise à jour des données :'
    newWindow: 'Nouvelle fenêtre'
    owner: 'Propriétaire :'
    ownerOverride: '{owner} :'
    share: 'Partager :'
    size: 'Taille :'
    spatial: 'Couverture géographique :'
    temporal: 'Couverture temporelle :'
    temporalStart: 'À partir de'
    text:
      api: API
      map: Carte
      table: Tableau
    tooltip:
      map: Ouvrir la vue carte en pleine page
      table: Ouvrir la vue tableau en pleine page
      api: Ouvrir la documentation d'API en pleine page
    thisSource: 'cette source'
    frequency: 'Fréquence de mise à jour :'
    topics: 'Thématiques :'
    updatedAt: Mis à jour le
</i18n>
