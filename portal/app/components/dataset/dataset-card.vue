<template>
  <v-card
    :to="`/datasets/${dataset.slug}`"
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
            role="img"
            :aria-label="t('imageAlt', { title: dataset.title })"
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
          :alt="t('imageAlt', { title: dataset.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
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
          {{ dataset.title }}
        </v-card-title>

        <!-- Thumbnail (Center Location) -->
        <v-img
          v-if="cardConfig.thumbnail?.location === 'center' && thumbnailUrl"
          :alt="t('imageAlt', { title: dataset.title })"
          :src="thumbnailUrl"
          :cover="cardConfig.thumbnail.crop"
          class="flex-grow-0"
          height="170"
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
        <!-- TODO: Convert to v-row ?-->
        <v-list-item>
          <template #prepend>
            <owner-avatar
              v-if="dataset.owner.department && cardConfig.showDepartment"
              :owner="dataset.owner"
            />
          </template>
          <!-- <span :class="['text-caption', dataset.owner.department && cardConfig.showDepartment ? 'ml-2' : '']">
            {{ t('updatedAt') }} {{ dayjs(dataset.dataUpdatedAt || dataset.updatedAt).format('L') }}
          </span> -->
        </v-list-item>

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
              :text="t('text.table')"
            />
            <action-btn
              v-if="dataset.bbox?.length"
              :to="`/datasets/${dataset.slug}/map`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiMapMarker"
              :text="t('text.map')"
            />
            <action-btn
              :to="`/datasets/${dataset.slug}/api-doc`"
              :action-style="cardConfig.actionsStyle"
              :icon="mdiCog"
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
            :text="t('text.table')"
            block
          />
          <action-btn
            v-if="dataset.bbox?.length"
            :to="`/datasets/${dataset.slug}/map`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiMapMarker"
            :text="t('text.map')"
            block
          />
          <action-btn
            :to="`/datasets/${dataset.slug}/api-doc`"
            :action-style="cardConfig.actionsStyle"
            :icon="mdiCog"
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
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiCog, mdiMapMarker, mdiTableLarge } from '@mdi/js'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { dataset, cardConfig, isPortalConfig } = defineProps<{
  dataset: Omit<Dataset, 'userPermissions'>,
  cardConfig: DatasetCard
  isPortalConfig?: boolean
}>()

// const { dayjs } = useLocaleDayjs()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const getPageImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const getPortalImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

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
    imageAlt: 'Thumbnail image for {title}'
    updatedAt: Updated at
    text:
      table: Table
      map: Map
      api: API documentation
    shortText:
      api: API

  fr:
    imageAlt: 'Image de couverture pour le jeu de données {title}'
    updatedAt: Mis à jour le
    text:
      table: Tableau
      map: Carte
      api: Documentation d'API
    shortText:
      api: API

</i18n>

<style scoped>
.title-two-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
