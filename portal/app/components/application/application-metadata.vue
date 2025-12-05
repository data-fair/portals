<template>
  <v-card
    :rounded="metadataConfig.rounded"
    :elevation="metadataConfig.elevation"
  >
    <!-- Application Metadata -->
    <v-row class="ma-0">
      <!--
        All fields are wrapped in v-cols for responsive grid layout
        that adapts to screen size and metadataLocation setting
        (full width or single column)
      -->

      <!-- Base application -->
      <v-col v-bind="metadataColProps">
        <div class="text-caption text-medium-emphasis"> {{ t('application') }}</div>
        {{ baseApplicationFetch.data.value?.title || application.url.split('/').slice(-3,-2).pop() }}
      </v-col>

      <!-- Owner -->
      <v-col
        v-if="metadataConfig.showDepartment && application.owner.department"
        v-bind="metadataColProps"
      >
        <div class="text-caption text-medium-emphasis">{{ customOwnerLabel ? t('ownerOverride', { owner: customOwnerLabel }) : t('owner') }}</div>
        <div class="d-flex align-center ga-2">
          <v-avatar
            :image="avatarUrl"
            :alt="customOwnerLabel ? t('ownerAvatarOverride', { owner: customOwnerLabel }) : t('ownerAvatar')"
            :title="application.owner.departmentName || application.owner.department"
            :size="28"
          />
          {{ application.owner.departmentName || application.owner.department }}
        </div>
      </v-col>
    </v-row>

    <v-divider />

    <!-- Actions, update date and share -->
    <v-row
      class="ma-0"
      align="center"
    >
      <v-col v-bind="metadataColProps">
        <action-btn
          :to="{
            path: `/applications/${application.slug}/full`,
            query: $route.query
          }"
          :action-style="metadataConfig.actionsStyle"
          :icon="mdiFullscreen"
          :text="t('text.full')"
          :short-text="t('shortText.full')"
        />
        <application-capture :application="application" />
        <application-embed
          v-if="!$vuetify.display.smAndDown"
          :application="application"
        />
        <!-- TODO: Show applications attachments ? -->
      </v-col>

      <v-col v-bind="metadataColProps">
        {{ t('updatedAt') }} {{ dayjs(application.updatedAt).format('LL') }}
      </v-col>

      <ClientOnly>
        <v-col v-if="application.public">
          {{ t('share') }}
          <social-share :title="application.title" />
        </v-col>
      </ClientOnly>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiFullscreen } from '@mdi/js'

type Application = {
  id: string
  slug: string
  title: string
  updatedAt: string
  image?: string
  url: string
  href: string
  exposedUrl: string
  public: boolean
  owner: Account
  baseApplication?: {
    meta?: {
      'df:capture-width'?: string
      'df:capture-height'?: string
    }
  }
}

const { application } = defineProps<{ application: Application }>()
const { portalConfig } = usePortalStore()
const { t } = useI18n()
const { dayjs } = useLocaleDayjs()

const baseApplicationFetch = useLocalFetch<{
  title: string
}>(`/data-fair/api/v1/applications/${application.id}/base-application`, { params: { html: true } })

const metadataConfig = computed(() => portalConfig.value.datasets.page.metadata || {})
const metadataColProps = computed(() => ({
  class: 'py-0 my-2',
  cols: 12,
  md: metadataConfig.value?.location !== 'right' ? 4 : 12
}))

const customOwnerLabel = portalConfig.value.labelsOverrides?.owner

const avatarUrl = computed(() => {
  if (application.owner.department) return `/simple-directory/api/avatars/${application.owner.type}/${application.owner.id}/${application.owner.department}/avatar.png`
  else return `/simple-directory/api/avatars/${application.owner.type}/${application.owner.id}/avatar.png`
})

</script>

<i18n lang="yaml">
  en:
    application: 'Application:'
    owner: 'Owner:'
    ownerOverride: '{owner}:'
    ownerAvatar: 'Owner avatar'
    ownerAvatarOverride: '{owner} - Avatar'
    share: 'Share:'
    shortText:
      full: Fullscreen
    text:
      full: Fullscreen application
    updatedAt: Updated at
  fr:
    application: 'Application :'
    owner: 'Propriétaire :'
    ownerOverride: '{owner} :'
    ownerAvatar: 'Avatar du propriétaire'
    ownerAvatarOverride: '{owner} - Avatar'
    share: 'Partager :'
    shortText:
      full: Plein écran
    text:
      full: Visualisation plein écran
    updatedAt: Mise à jour le
</i18n>
