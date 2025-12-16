<template>
  <v-card
    :rounded="metadataConfig.rounded"
    :elevation="metadataConfig.elevation"
  >
    <!-- Dataset Metadata -->
    <v-row class="ma-0">
      <!--
        All fields are wrapped in v-cols for responsive grid layout
        that adapts to screen size and metadata.location setting
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
        v-if="metadataConfig.showDepartment"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis">{{ customOwnerLabel ? t('ownerOverride', { owner: customOwnerLabel }) : t('owner') }}</div>
        <div class="d-flex align-center ga-2">
          <v-avatar
            :image="avatarUrl"
            :title="customOwnerLabel ? t('ownerAvatarOverride', { owner: customOwnerLabel }) : t('ownerAvatar')"
            :size="28"
          />
          {{ dataset.owner.departmentName || dataset.owner.department || dataset.owner.name }}
        </div>
      </v-col>

      <!-- Creator -->
      <v-col
        v-if="dataset.creator"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis">{{ metadataLabel('creator') }}</div>
        <div class="d-flex align-center ga-2">
          {{ dataset.creator }}
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
        <div class="text-caption text-medium-emphasis"> {{ metadataLabel('keywords') }}</div>
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
        <div class="text-caption text-medium-emphasis"> {{ metadataLabel('spatial') }}</div>
        {{ dataset.spatial }}
      </v-col>

      <v-col
        v-if="dataset.temporal?.start"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis"> {{ metadataLabel('temporal') }}</div>
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
        <div class="text-caption text-medium-emphasis"> {{ metadataLabel('frequency') }}</div>
        {{ t('frequencyLabels.' + dataset.frequency) }}
      </v-col>

      <!-- Modified or dataUpdatedAt -->
      <v-col v-bind="metadataColProps">
        <div class="text-caption text-medium-emphasis">{{ metadataLabel('modified') }}</div>
        <div class="d-flex align-center ga-2">
          {{ dayjs(dataset.modified || dataset.dataUpdatedAt).format('LL') }}
        </div>
      </v-col>

      <!-- Custom metadata -->
      <v-col
        v-for="customMeta in metadataSettings.data.value?.custom"
        :key="customMeta.key"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis">{{ customMeta.title || customMeta.key }}</div>
        <div>{{ dataset.customMetadata?.[customMeta.key] }}</div>
      </v-col>

      <v-col
        v-if="metadataConfig.showAttachments && dataset.attachments?.filter(a => a.url !== dataset!.image).length"
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
          <action-btn
            v-if="shouldShowActionButton('table')"
            :to="{
              path: `/datasets/${dataset.slug}/table`,
              query: $route.query
            }"
            :action-style="metadataConfig.actionsStyle"
            :icon="mdiTableLarge"
            :text="t('text.table')"
          />
          <action-btn
            v-if="dataset.bbox?.length && shouldShowActionButton('map')"
            :to="`/datasets/${dataset.slug}/map`"
            :action-style="metadataConfig.actionsStyle"
            :icon="mdiMapMarker"
            :text="t('text.map')"
          />
          <action-btn
            v-if="!$vuetify.display.smAndDown && shouldShowActionButton('api')"
            :to="`/datasets/${dataset.slug}/api-doc`"
            :action-style="metadataConfig.actionsStyle"
            :icon="mdiCog"
            :text="t('text.api')"
            :short-text="t('shortText.api')"
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
      </v-col>

      <!-- <v-col v-bind="metadataColProps">
        {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('LL') }}
      </v-col> -->

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
import type { Dataset } from '#api/types/index.ts'
import type { ActionButtons } from '#api/types/portal-config'
import { mdiCog, mdiMapMarker, mdiTableLarge } from '@mdi/js'
import formatBytes from '@data-fair/lib-vue/format/bytes.js'

const { dataset } = defineProps<{ dataset: Dataset }>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()
const { dayjs } = useLocaleDayjs()

const metadataConfig = computed(() => portalConfig.value.datasets.page.metadata || {})
const metadataColProps = computed(() => ({
  class: 'py-0 my-2',
  cols: 12,
  md: metadataConfig.value.location !== 'right' ? 4 : 12
}))

const customOwnerLabel = portalConfig.value.labelsOverrides?.owner

const avatarUrl = computed(() => {
  if (dataset.owner.department) return `/simple-directory/api/avatars/${dataset.owner.type}/${dataset.owner.id}/${dataset.owner.department}/avatar.png`
  else return `/simple-directory/api/avatars/${dataset.owner.type}/${dataset.owner.id}/avatar.png`
})

const shouldShowActionButton = (button: ActionButtons[number]) => metadataConfig.value.actionButtons?.includes(button)

type BaseMetadataSettings = Partial<Record<'keywords' | 'frequency' | 'temporal' | 'spatial' | 'modified' | 'creator',
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
    records: '{count} record | {count} records'
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
    keywords: 'Keywords:'
    license: 'License:'
    owner: 'Owner:'
    ownerOverride: '{owner}:'
    ownerAvatar: 'Owner avatar'
    ownerAvatarOverride: '{owner} - Avatar'
    modified: 'Data last modified:'
    share: 'Share:'
    shortText:
      api: API
    size: 'Size:'
    spatial: 'Spatial coverage:'
    temporal: 'Temporal coverage:'
    temporalStart: 'From'
    text:
      api: API documentation
      map: Map
      table: Table
    thisSource: 'this source'
    frequency: 'Update frequency:'
    updatedAt: Updated at
  fr:
    attachments: 'Pièces jointes :'
    creator: 'Producteur :'
    dataFrom: 'Données issues de'
    dataProducedBy: 'Provenance des données :'
    records: '{count} enregistrement | {count} enregistrements'
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
    keywords: 'Mots-clés :'
    license: 'Licence :'
    modified: 'Dernière mise à jour des données :'
    owner: 'Propriétaire :'
    ownerOverride: 'Propriétaire :'
    ownerAvatar: 'Avatar du propriétaire'
    ownerAvatarOverride: '{owner} - Avatar'
    share: 'Partager :'
    shortText:
      api: API
    size: 'Taille :'
    spatial: 'Couverture géographique :'
    temporal: 'Couverture temporelle :'
    temporalStart: 'À partir de'
    text:
      api: Documentation d'API
      map: Carte
      table: Tableau
    thisSource: 'cette source'
    frequency: 'Fréquence de mise à jour :'
    updatedAt: Mis à jour le
</i18n>
