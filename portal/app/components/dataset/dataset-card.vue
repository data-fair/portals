<template>
  <!--
    :to => disabled in preview
    link => simulate link style in preview
  -->
  <v-card
    :to="!preview ? `/datasets/${dataset.slug}` : undefined"
    :elevation="cardConfig.elevation ?? 0"
    :rounded="cardConfig.rounded ?? 'default'"
    class="h-100 d-flex flex-column"
    link
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
          v-if="cardConfig.thumbnail && (cardConfig.thumbnail?.location === 'top' || (cardConfig.thumbnail?.location === 'left' && $vuetify.display.smAndDown)) && thumbnailUrl"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
          aria-hidden="true"
        />

        <!--
          text-two-lines and 'height': titleHeight=> truncate title to 2 lines
          white-space: unset; => remove default nowrap from v-card-title
        -->
        <v-card-title
          :class="['font-weight-bold', { 'text-two-lines': cardConfig.titleLinesCount === 2 }]"
          :style="[
            cardConfig.titleLinesCount === 0 ? { 'white-space': 'unset' } : {},
            cardConfig.titleLinesCount === 2 ? { 'height': titleHeight } : {}
          ]"
        >
            {{ dataset.title }}
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
          v-if="cardConfig.showSummary && dataset.summary?.length"
          class="pb-0"
        >
          {{ dataset.summary }}
        </v-card-text>

        <v-spacer />

        <!-- Topics List -->
        <topics-list
          v-if="cardConfig.topics?.show && dataset.topics?.length"
          :config="cardConfig.topics"
          :topics="dataset.topics"
          class="px-4 mt-2 flex-grow-0"
        />

        <!-- Keywords list -->
        <keywords-list
          v-if="cardConfig.keywords?.show && dataset.keywords?.length"
          :config="cardConfig.keywords"
          :keywords="dataset.keywords"
          class="px-4 mt-2 flex-grow-0"
        />

        <!-- Department / Updated At -->
        <v-row
          v-if="cardConfig.showDepartment"
          class="px-4 my-2"
          dense
        >
          <v-col
            v-if="cardConfig.showDepartment"
            cols="auto"
            class="d-flex align-center"
          >
            <owner-avatar
              :owner="dataset.owner"
              omit-owner-name
            />
          </v-col>
          <!-- <v-col
            cols="auto"
            class="d-flex align-center"
            :class="{ 'ml-2': cardConfig.showDepartment }"
          >
            <span class="text-caption">
              {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
            </span>
          </v-col> -->
        </v-row>
        <div v-else class="mt-3" /> <!-- TODO: Remove it when dataset expose directly a standardize update date-->

        <!-- Actions (Bottom Location) -->
        <template v-if="(cardConfig.actionsLocation === 'bottom' || $vuetify.display.smAndDown) && !dataset.isMetaOnly">
          <v-divider />
          <!--
            ga-0 => remove default v-card-actions gap between action buttons
            cursor-default and @click.prevent => disable card link on action buttons
            min-height: auto => remove default v-card-actions min-height
          -->
          <v-card-actions
            class="py-2 ga-0 cursor-default"
            style="min-height: auto"
            @click.prevent
          >
            <action-btn
              :to="`/datasets/${dataset.slug}/table`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiTableLarge"
              :resource-title="dataset.title"
              :text="t('text.table')"
            />
            <action-btn
              v-if="dataset.bbox?.length"
              :to="`/datasets/${dataset.slug}/map`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiMapMarker"
              :resource-title="dataset.title"
              :text="t('text.map')"
            />
            <action-btn
              :to="`/datasets/${dataset.slug}/api-doc`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiCog"
              :resource-title="dataset.title"
              :text="t('text.api')"
              :short-text="t('shortText.api')"
            />
          </v-card-actions>
        </template>
      </v-col>

      <!-- Actions (Right Location) -->
      <template v-if="cardConfig.actionsLocation === 'right' && !$vuetify.display.smAndDown && !dataset.isMetaOnly">
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
          <action-btn
            :to="`/datasets/${dataset.slug}/table`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiTableLarge"
            :resource-title="dataset.title"
            :text="t('text.table')"
            block
          />
          <action-btn
            v-if="dataset.bbox?.length"
            :to="`/datasets/${dataset.slug}/map`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiMapMarker"
            :resource-title="dataset.title"
            :text="t('text.map')"
            block
          />
          <action-btn
            :to="`/datasets/${dataset.slug}/api-doc`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiCog"
            :resource-title="dataset.title"
            :text="t('text.api')"
            :short-text="t('shortText.api')"
            block
          />
        </v-col>
      </template>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiCog, mdiMapMarker, mdiTableLarge } from '@mdi/js'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { dataset, cardConfig, isPortalConfig } = defineProps<{
  dataset: Omit<Dataset, 'userPermissions'>,
  cardConfig: DatasetCard
  isPortalConfig?: boolean
}>()

// const { dayjs } = useLocaleDayjs()
const { portalConfig, preview } = usePortalStore()
const { t } = useI18n()
const getPageImageSrc = usePageImageSrc()
const getPortalImageSrc = usePortalImageSrc()

const thumbnailUrl = computed(() => {
  if (!cardConfig.thumbnail?.show) return undefined
  if (dataset.image) return dataset.image
  if (cardConfig.thumbnail.useTopic && dataset.topics?.[0]?.id) {
    const topicConfig = portalConfig.value.topics?.find((t) => t.id === dataset.topics![0]!.id)
    if (topicConfig?.thumbnail) return getPortalImageSrc(topicConfig.thumbnail, false)
  }
  if (cardConfig.thumbnail.useApplication && dataset.extras?.applications?.[0]) {
    return `/data-fair/api/v1/applications/${dataset.extras.applications[0].id}/capture?updatedAt=${dataset.extras.applications[0].updatedAt}`
  }
  if (cardConfig.thumbnail?.default) return (isPortalConfig ? getPortalImageSrc : getPageImageSrc)(cardConfig.thumbnail.default, false)
  return undefined
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
  const titleElement = document.querySelector('.text-two-lines')
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
      table: Table
      map: Map
      api: API documentation
    shortText:
      api: API

  fr:
    updatedAt: Mis à jour le
    text:
      table: Tableau
      map: Carte
      api: Documentation d'API
    shortText:
      api: API

</i18n>
