<template>
  <div v-if="useConfig">
    <!-- Title and link -->
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">
        {{ useConfig.title }}
      </h1>
      <v-spacer />
      <v-btn
        v-if="useConfig.link"
        :href="useConfig.link"
        target="_blank"
        color="primary"
        variant="outlined"
      >
        {{ t('visitLink') }}
        <v-icon
          :icon="mdiOpenInNew"
          end
        />
      </v-btn>
    </div>

    <!-- Author -->
    <p
      v-if="useConfig.author"
      class="text-subtitle-1 mb-4"
    >
      {{ t('publishedBy', { author: useConfig.author }) }}
    </p>

    <!-- Image -->
    <v-img
      v-if="useConfig.image"
      :src="getImageSrc(useConfig.image, false)"
      :alt="useConfig.title"
      class="mb-4"
      max-height="400"
      cover
    />

    <!-- Summary -->
    <p
      v-if="useConfig.summary"
      class="text-body-1 mb-4"
    >
      {{ useConfig.summary }}
    </p>

    <!-- Description (rendered markdown) -->
    <div
      v-if="useConfig._descriptionHtml"
      class="markdown-content mb-4"
      v-html="/*eslint-disable-line vue/no-v-html*/useConfig._descriptionHtml"
    />

    <!-- Datasets -->
    <template v-if="useConfig.datasets?.length">
      <h2 class="text-h5 mb-4">
        {{ t('datasets') }}
      </h2>
      <v-list>
        <v-list-item
          v-for="dataset in useConfig.datasets"
          :key="dataset.id"
          :title="dataset.title"
        >
          <template #prepend>
            <v-icon :icon="mdiDatabase" />
          </template>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UseConfig } from '#api/types/use-config'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { mdiOpenInNew, mdiDatabase } from '@mdi/js'

const { useConfig } = defineProps<{
  useConfig?: UseConfig
}>()

const { t } = useI18n()

const getImageSrc = inject<(imageRef: ImageRef, mobile: boolean) => string>('get-image-src', (imageRef: ImageRef) => {
  return $apiPath + '/images/' + imageRef._id + '/data'
})

</script>

<i18n lang="yaml">
  en:
    visitLink: Visit link
    publishedBy: Published by {author}
    datasets: Linked datasets

  fr:
    visitLink: Visiter le lien
    publishedBy: Publié par {author}
    datasets: Jeux de données associés

</i18n>

<style scoped>
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(p) {
  margin-bottom: 1em;
}
</style>
