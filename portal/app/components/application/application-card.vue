<template>
  <v-card
    :to="`/applications/${application.slug}`"
    class="h-100 d-flex flex-column"
  >
    <!-- Vertical layout -->
    <template v-if="portalConfig.applications.cardsLayout === 'vertical' || $vuetify.display.xs">
      <v-card-title>{{ application.title }}</v-card-title>

      <v-img
        :src="thumbnailUrl"
        :cover="portalConfig.applications.cropThumbnails"
        :alt="t('imageAlt', { title: application.title })"
        height="170"
      />

      <v-list-item v-if="portalConfig.applications.actionsStyle !== 'icon'">
        <template #prepend>
          <owner-avatar
            v-if="application.owner.department && portalConfig.applications.showDepartment"
            :owner="application.owner"
          />
        </template>
        <span :class="['text-caption', application.owner.department && portalConfig.applications.showDepartment ? 'ml-2' : '']">
          {{ t('updatedAt') }} {{ dayjs(application.updatedAt).format('L') }}
        </span>
      </v-list-item>

      <v-divider />
      <v-card-actions
        class="py-2 ga-0 cursor-default"
        style="min-height: auto"
        @click.prevent
      >
        <template v-if="portalConfig.applications.actionsLocation !== 'none' && !$vuetify.display.smAndDown">
          <application-preview :application="application" />
          <action-btn
            :to="`/applications/${application.slug}/full`"
            :action-style="portalConfig.applications.actionsStyle"
            :icon="mdiFullscreen"
            :text="t('text.full')"
            :short-text="t('shortText.full')"
          />
        </template>

        <template v-if="portalConfig.applications.actionsStyle === 'icon'">
          <v-spacer />
          <span class="text-caption mr-2">
            {{ t('updatedAt') }} {{ dayjs(application.updatedAt).format('L') }}
          </span>
          <owner-avatar
            v-if="application.owner.department && portalConfig.applications.showDepartment"
            :owner="application.owner"
          />
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
          :alt="t('imageAlt', { title: application.title })"
          :src="thumbnailUrl"
          :cover="portalConfig.applications.cropThumbnails"
          class="h-100"
        />
      </v-col>
      <v-divider vertical />
      <v-col class="d-flex flex-column">
        <v-card-title>{{ application.title }}</v-card-title>
        <v-card-text>{{ application.description }}</v-card-text>

        <v-spacer />
        <v-divider />
        <v-card-actions
          class="py-2 ga-0 cursor-default"
          style="min-height: auto"
          @click.prevent
        >
          <template v-if="portalConfig.applications.actionsLocation !== 'none' && !$vuetify.display.smAndDown">
            <application-preview :application="application" />
            <action-btn
              :to="`/applications/${application.slug}/full`"
              :action-style="portalConfig.applications.actionsStyle"
              :icon="mdiFullscreen"
              :text="t('text.full')"
              :short-text="t('shortText.full')"
            />
          </template>

          <v-spacer />
          <span class="text-caption mr-2">
            {{ t('updatedAt') }} {{ dayjs(application.updatedAt).format('L') }}
          </span>
          <owner-avatar
            v-if="application.owner.department && portalConfig.applications.showDepartment"
            :owner="application.owner"
          />
        </v-card-actions>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiFullscreen } from '@mdi/js'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { application } = defineProps<{
  application: {
    id: string
    slug: string
    title: string
    description: string
    updatedAt: string
    image?: string
    url: string
    href: string
    exposedUrl: string
    owner: Account
    topics: { id: string; title: string }[]
  }
}>()

const { dayjs } = useLocaleDayjs()
const { t } = useI18n()
const { portalConfig } = usePortalStore()

const thumbnailUrl = computed(() => {
  if (application.image) return application.image
  else return `${application.href}/capture?updatedAt=${application.updatedAt}`
})

</script>

<i18n lang="yaml">
  en:
    imageAlt: 'Thumbnail image for {title}'
    updatedAt: Updated at
    text:
      full: Fullscreen application
    shortText:
      full: Fullscreen
  fr:
    imageAlt: 'Image de couverture pour la visualisation {title}'
    updatedAt: Mise à jour le
    text:
      full: Visualisation plein écran
    shortText:
      full: Plein écran

</i18n>
