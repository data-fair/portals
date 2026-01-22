<template>
  <v-card
    :to="`/applications/${application.slug}`"
    class="h-100 d-flex flex-column"
    :elevation="cardConfig.elevation ?? 0"
    :rounded="cardConfig.rounded ?? 'default'"
  >
    <!--
      flex-nowrap => prevent columns from wrapping on multiple rows
      no-gutters => remove spaces between columns
    -->
    <v-row
      class="flex-nowrap"
      no-gutters
    >
      <!-- Thumbnail (Left Location) -->
      <!-- On mobile, always use top location -->
      <template v-if="cardConfig.thumbnail?.location === 'left' && !$vuetify.display.smAndDown">
        <v-col cols="4">
          <div
            v-if="thumbnailUrl"
            aria-hidden="true"
            :style="leftThumbnailStyle"
          />
        </v-col>
        <v-divider vertical />
      </template>

      <!-- Main column -->
      <!--
        d-flex flex-column => make the column take full height of the card and arrange content vertically
        min-width: 0 => override default min-width: auto to allow the column to shrink below its content's intrinsic width, enabling text truncation and preventing card overflow
      -->
      <v-col
        class="d-flex flex-column"
        style="min-width: 0"
      >
        <!-- Thumbnail (Top Location) -->
        <v-img
          v-if="cardConfig.thumbnail && (cardConfig.thumbnail?.location === 'top' || $vuetify.display.smAndDown) && thumbnailUrl"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
          aria-hidden="true"
        />

        <!--
          title-two-lines and 'height': titleHeight=> truncate title to 2 lines
          white-space: unset; => remove default nowrap from v-card-title
        -->
        <v-card-title
          :class="['font-weight-bold', { 'title-two-lines': cardConfig.titleLinesCount === 2 }]"
          :style="[
            cardConfig.titleLinesCount !== 1 ? { 'white-space': 'unset' } : {},
            cardConfig.titleLinesCount === 2 ? { 'height': titleHeight } : {}
          ]"
        >
          {{ application.title }}
        </v-card-title>

        <!-- Thumbnail (Center Location) -->
        <v-img
          v-if="cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
          aria-hidden="true"
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

        <!-- Department / Updated At -->
        <v-row
          no-gutters
          class="px-4 py-2"
        >
          <v-col
            v-if="cardConfig.showDepartment"
            cols="auto"
            class="d-flex align-center"
          >
            <owner-avatar
              :owner="application.owner"
              omit-owner-name
            />
          </v-col>
          <v-col
            cols="auto"
            class="d-flex align-center"
            :class="{ 'ml-2': cardConfig.showDepartment }"
          >
            <span class="text-caption">
              {{ t('updatedAt') }} {{ dayjs(application.updatedAt).format('L') }}
            </span>
          </v-col>
        </v-row>

        <!-- Actions (Bottom Location) -->
        <template v-if="cardConfig.actionsLocation === 'bottom' || $vuetify.display.smAndDown">
          <v-divider />
          <!--
            cursor-default and @click.prevent => disable card link on action buttons
            ga-0 => remove default v-card-actions gap between action buttons
            min-height: auto => remove default v-card-actions min-height
          -->
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
              :resource-title="application.title"
              :text="t('text.full')"
              :short-text="t('shortText.full')"
            />
          </v-card-actions>
        </template>
      </v-col>

      <!-- Actions (Right Location) -->
      <template v-if="cardConfig.actionsLocation === 'right' && !$vuetify.display.smAndDown">
        <v-divider vertical />
        <!--
          cols=auto => fit column width to largest button
          cursor-default and @click.prevent => disable card link on action buttons
        -->
        <v-col
          cols="auto"
          class="pa-2 cursor-default"
          @click.prevent
        >
          <application-preview :application="application" block />
          <action-btn
            :to="`/applications/${application.slug}/full`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiFullscreen"
            :resource-title="application.title"
            :text="t('text.full')"
            :short-text="t('shortText.full')"
            block
          />
        </v-col>
      </template>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import type { ApplicationCard } from '#api/types/portal-config'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { mdiFullscreen } from '@mdi/js'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { application, cardConfig } = defineProps<{
  application: Application
  cardConfig: ApplicationCard
}>()

const { dayjs } = useLocaleDayjs()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const getPortalImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

const thumbnailUrl = computed(() => {
  if (!cardConfig.thumbnail?.show) return undefined
  if (application.image) return application.image
  if (cardConfig.thumbnail.useTopic && application.topics?.[0]?.id) {
    const topicConfig = portalConfig.value.topics?.find((t) => t.id === application.topics![0]!.id)
    if (topicConfig?.thumbnail) return getPortalImageSrc(topicConfig.thumbnail, false)
  }
  return `${application.href}/capture?updatedAt=${application.updatedAt}`
})

// Set thumbnail in background for left location to cover full height of the card
const leftThumbnailStyle = computed(() => {
  if (!thumbnailUrl.value) return undefined
  return {
    backgroundImage: `url("${thumbnailUrl.value}")`,
    backgroundSize: cardConfig.thumbnail?.crop ? 'cover' : 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '200px',
    height: '100%'
  }
})

// Height calculation for title with 2 lines
const titleHeight = ref<string>()
onMounted(() => {
  const titleElement = document.querySelector('.title-two-lines')
  if (titleElement) {
    const styles = getComputedStyle(titleElement)
    const lineHeight = parseFloat(styles.lineHeight)
    const paddingTop = parseFloat(styles.paddingTop)
    const paddingBottom = parseFloat(styles.paddingBottom)
    titleHeight.value = `${lineHeight * 2 + paddingTop + paddingBottom}px`
  }
})

</script>

<i18n lang="yaml">
  en:
    updatedAt: Updated at
    text:
      full: Fullscreen application
    shortText:
      full: Fullscreen
  fr:
    updatedAt: Mise à jour le
    text:
      full: Visualisation plein écran
    shortText:
      full: Plein écran

</i18n>

<style scoped>
.title-two-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
