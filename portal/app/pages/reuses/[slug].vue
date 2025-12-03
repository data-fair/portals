<template>
  <!-- Error state -->
  <page-error
    v-if="reuseData.error.value"
    :status-code="reuseData.error.value.statusCode || 500"
    :title="errorTitle"
    :link="{
      type: 'standard',
      subtype: 'reuses',
      title: t('backToReuses')
    }"
  />

  <template v-else-if="reuseData.data.value">
    <!-- Title and link -->
    <div class="d-flex align-center mb-4 flex-wrap gap-2">
      <h1 class="text-h4">
        {{ reuseData.data.value.config.title }}
      </h1>
      <v-spacer />
      <nav-link
        v-if="reuseData.data.value.config.link"
        :link="{
          type: 'external',
          href: reuseData.data.value.config.link,
          title: t('visitLink')
        }"
        :config="portalConfig.navLinksConfig"
      />
    </div>

    <!-- Author -->
    <p
      v-if="reuseData.data.value.config.author"
      class="text-subtitle-1 mb-4"
    >
      {{ t('publishedBy', { author: reuseData.data.value.config.author }) }}
    </p>

    <!-- Image -->
    <v-img
      v-if="reuseData.data.value.config.image"
      :src="getImageSrc(reuseData.data.value.config.image, false)"
      :alt="reuseData.data.value.config.title"
      class="mb-4"
      max-height="400"
    />

    <!-- Description (rendered markdown) -->
    <div
      v-if="reuseData.data.value.config._descriptionHtml"
      class="markdown-content mb-6"
      v-html="/*eslint-disable-line vue/no-v-html*/reuseData.data.value.config._descriptionHtml"
    />

    <!-- Datasets -->
    <template v-if="reuseData.data.value.config.datasets?.length">
      <page-element-title
        :element="{
          type: 'title',
          content: t('datasets'),
          titleSize: 'h5',
          line: portalConfig.datasets.page.titleStyle
        }"
      />
      <v-row>
        <v-col
          v-for="dataset in reuseData.data.value.config.datasets"
          :key="dataset.id"
          cols="12"
          md="4"
        >
          <v-card
            :to="`/datasets/${dataset.slug || dataset.id}`"
            :elevation="portalConfig.datasets.card.elevation ?? 0"
            :rounded="portalConfig.datasets.card.rounded ?? 'default'"
          >
            <v-card-title class="font-weight-bold">
              {{ dataset.title }}
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Back to reuses link -->
    <v-row
      class="my-4"
      justify="center"
    >
      <nav-link
        :link="{
          type: 'standard',
          subtype: 'reuses',
          title: t('backToReuses'),
          icon: { custom: mdiChevronLeft }
        }"
        :config="portalConfig.navLinksConfig"
      />
    </v-row>
  </template>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { mdiChevronLeft } from '@mdi/js'

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

const reuseData = await useFetch<Pick<Reuse, '_id' | 'slug' | 'config'>>(`/portal/api/reuses/${slug}`, {
  watch: false
})

const errorTitle = computed(() => {
  const code = reuseData.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('reuseNotFound')
  return t('reuseError')
})

const getImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/reuses/${slug}/images/${id}`
}

watch(() => reuseData.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'reuses' },
    { title: reuseData.data.value?.config.title || t('reuse') }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (reuseData.data.value?.config.title || t('reuse')) + ' - ' + portalConfig.value.title,
  description: () => reuseData.data.value?.config.summary || portalConfig.value.description,
  ogType: 'article'
})
</script>

<i18n lang="yaml">
  en:
    backToReuses: Back to Reuses List
    reuse: Reuse
    reuseNotFound: The requested reuse was not found
    reuseError: An error occurred while loading the reuse
    visitLink: Visit link
    publishedBy: Published by {author}
    datasets: Linked datasets
  fr:
    backToReuses: Retourner à la liste des réutilisations
    reuse: Réutilisation
    reuseNotFound: La réutilisation demandée n'a pas été trouvée
    reuseError: Une erreur est survenue lors du chargement de la réutilisation
    visitLink: Visiter le lien
    publishedBy: Publié par {author}
    datasets: Jeux de données associés
</i18n>
