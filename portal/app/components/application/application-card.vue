<template>
  <v-card
    :to="`/applications/${application.slug}`"
    class="h-100 d-flex flex-column"
  >
    <v-row
      class="flex-nowrap"
      no-gutters
    >
      <!-- Image column -->
      <v-col
        v-if="cardConfig.thumbnail?.location === 'left'"
        cols="4"
      >
        <v-img
          v-if="thumbnailUrl"
          :alt="t('imageAlt', { title: application.title })"
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
          :alt="t('imageAlt', { title: application.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
        />
        <v-card-title style="white-space: unset;">{{ application.title }}</v-card-title>
        <v-img
          v-if="cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
          :alt="t('imageAlt', { title: application.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
        />
        <v-card-text
          v-if="cardConfig.showSummary && application.summary?.length"
          class="pb-0"
        >
          {{ application.summary }}
        </v-card-text>

        <v-spacer />

        <!-- Topics List -->
        <topics-list
          v-if="cardConfig.topics?.show && application.topics?.length"
          :config="cardConfig.topics"
          :topics="application.topics"
          class="px-4 mt-2 flex-grow-0"
        />

        <v-list-item>
          <template #prepend>
            <owner-avatar
              v-if="application.owner.department && cardConfig.showDepartment"
              :owner="application.owner"
            />
          </template>
          <span :class="['text-caption', application.owner.department && cardConfig.showDepartment ? 'ml-2' : '']">
            {{ t('updatedAt') }} {{ dayjs(application.updatedAt).format('L') }}
          </span>
        </v-list-item>

        <!-- Actions (Bottom Location) -->
        <template v-if="cardConfig.actionsLocation === 'bottom' || $vuetify.display.smAndDown">
          <v-divider />
          <v-card-actions
            class="py-2 ga-0 cursor-default"
            style="min-height: auto"
            @click.prevent
          >
            <application-preview :application="application" />
            <action-btn
              :to="`/applications/${application.slug}/full`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiFullscreen"
              :text="t('text.full')"
              :short-text="t('shortText.full')"
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
          <application-preview :application="application" />
          <action-btn
            :to="`/applications/${application.slug}/full`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiFullscreen"
            :text="t('text.full')"
            :short-text="t('shortText.full')"
          />
        </v-col>
      </template>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import type { ApplicationCard } from '#api/types/portal-config'
import { mdiFullscreen } from '@mdi/js'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { application, cardConfig } = defineProps<{
  application: {
    id: string
    slug: string
    title: string
    summary?: string
    updatedAt: string
    image?: string
    url: string
    href: string
    exposedUrl: string
    owner: Account
    topics: { id: string; title: string; color: string }[]
  }
  cardConfig: ApplicationCard
}>()

const { dayjs } = useLocaleDayjs()
const { t } = useI18n()

const thumbnailUrl = computed(() => {
  if (!cardConfig.thumbnail?.show) return undefined
  if (application.image) return application.image
  return `${application.href}/capture?updatedAt=${application.updatedAt}`
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
