<template>
  <v-card
    :rounded="metadataConfig.rounded ?? portalConfig.defaults?.rounded"
    :elevation="metadataConfig.elevation ?? portalConfig.defaults?.elevation"
  >
    <!-- Application Metadata -->
    <v-row
      class="px-3 py-2"
      density="compact"
    >
      <!--
        All fields are wrapped in v-cols for responsive grid layout
        that adapts to screen size and metadataLocation setting
        (full width or single column)
      -->

      <!-- Base application -->
      <v-col
        v-if="showBaseApplication"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis"> {{ t('application') }}</div>
        {{ baseApplicationFetch.data.value?.title || application.url.split('/').slice(-3,-2).pop() }}
      </v-col>

      <!-- Owner -->
      <v-col
        v-if="metadataConfig.showDepartment"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ customOwnerLabel ? t('ownerOverride', { owner: customOwnerLabel }) : t('owner') }}</div>
        <div class="d-flex align-center ga-2">
          <owner-avatar
            :owner="application.owner"
            :show-tooltip="false"
            aria-hidden="true"
          />
          {{ application.owner.departmentName || application.owner.department || application.owner.name }}
        </div>
      </v-col>

      <!-- Topics -->
      <v-col
        v-if="topicsConfig?.show && application.topics?.length"
        v-bind="metadataColProps"
      >
        <div class="text-body-small text-medium-emphasis">{{ t('topics') }}</div>
        <topics-list
          :topics="application.topics"
          :config="topicsConfig"
        />
      </v-col>

      <!-- Update dates -->
      <v-col v-bind="metadataColProps">
        <div v-if="dataUpdatedAt">{{ t('dataUpdatedAt') }} {{ dayjs(dataUpdatedAt).format('LL') }}</div>
        <div>{{ t('updatedAt') }} {{ dayjs(application.updatedAt).format('LL') }}</div>
      </v-col>

      <!-- Share (location not right)-->
      <ClientOnly>
        <v-col
          v-if="application.public && metadataConfig.location !== 'right'"
          v-bind="metadataColProps"
        >
          <div class="text-body-small text-medium-emphasis">{{ t('share') }}</div>
          <social-share :title="application.title" />
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
        <action-btn
          :to="{
            path: `/applications/${application.slug}/full`,
            query: $route.query
          }"
          :action-style="metadataConfig.actionsStyle"
          :icon="mdiFullscreen"
          :resource-title="application.title"
          :text="t('text')"
          :tooltip="t('tooltip')"
        />
        <application-capture :application="application" />
        <application-embed
          v-if="!$vuetify.display.smAndDown"
          :application="application"
        />
        <application-install
          v-if="$vuetify.display.smAndDown"
          :application="application"
        />
        <edit-resource-btn
          kind="application"
          :resource="application"
          :action-style="metadataConfig.actionsStyle"
        />
        <!-- TODO: Show applications attachments ? (not implemented in V1) -->
      </v-col>

      <ClientOnly>
        <v-col v-if="application.public && metadataConfig.location === 'right'">
          {{ t('share') }}
          <social-share :title="application.title" />
        </v-col>
      </ClientOnly>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import OwnerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'
import { mdiFullscreen } from '@mdi/js'

const { application } = defineProps<{ application: Application, dataUpdatedAt?: string }>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()
const { dayjs } = useLocaleDayjs()

const metadataConfig = computed(() => portalConfig.value.applications.page.metadata || {})
const showBaseApplication = computed(() => metadataConfig.value.showBaseApplication !== false)

const baseApplicationFetch = useLocalFetch<{
  title: string
}>(`/data-fair/api/v1/applications/${application.id}/base-application`, {
  params: { html: 'vuetify' },
  immediate: showBaseApplication.value
})

const topicsConfig = computed(() => portalConfig.value.applications.page.topics)
const metadataColProps = computed(() => ({
  class: 'py-0',
  cols: 12,
  md: metadataConfig.value?.location !== 'right' ? 4 : 12
}))

const customOwnerLabel = portalConfig.value.labelsOverrides?.owner

</script>

<i18n lang="yaml">
  en:
    application: 'Application:'
    owner: 'Owner:'
    ownerOverride: '{owner}:'
    share: 'Share:'
    text: Fullscreen
    tooltip: Open the application in full page
    dataUpdatedAt: Data updated at
    topics: 'Topics:'
    updatedAt: Visualization updated at
  fr:
    application: 'Application :'
    owner: 'Propriétaire :'
    ownerOverride: '{owner} :'
    share: 'Partager :'
    text: Plein écran
    tooltip: Ouvrir la visualisation en pleine page
    dataUpdatedAt: Données mises à jour le
    topics: 'Thématiques :'
    updatedAt: Visualisation mise à jour le
</i18n>
