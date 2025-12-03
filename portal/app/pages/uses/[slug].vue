<template>
  <!-- Error state -->
  <page-error
    v-if="useData.error.value"
    :status-code="useData.error.value.statusCode || 500"
    :title="errorTitle"
    :link="{
      type: 'standard',
      subtype: 'uses',
      title: t('backToUses')
    }"
  />

  <template v-else-if="useData.data.value">
    <!-- Title and link -->
    <div class="d-flex align-center mb-4 flex-wrap gap-2">
      <h1 class="text-h4">
        {{ useData.data.value.config.title }}
      </h1>
      <v-spacer />
      <nav-link
        v-if="useData.data.value.config.link"
        :link="{
          type: 'external',
          href: useData.data.value.config.link,
          title: t('visitLink')
        }"
        :config="portalConfig.navLinksConfig"
      />
    </div>

    <!-- Author -->
    <p
      v-if="useData.data.value.config.author"
      class="text-subtitle-1 mb-4"
    >
      {{ t('publishedBy', { author: useData.data.value.config.author }) }}
    </p>

    <!-- Image -->
    <v-img
      v-if="useData.data.value.config.image"
      :src="getImageSrc(useData.data.value.config.image, false)"
      :alt="useData.data.value.config.title"
      class="mb-4"
      max-height="400"
    />

    <!-- Description (rendered markdown) -->
    <div
      v-if="useData.data.value.config._descriptionHtml"
      class="markdown-content mb-6"
      v-html="/*eslint-disable-line vue/no-v-html*/useData.data.value.config._descriptionHtml"
    />

    <!-- Datasets -->
    <template v-if="useData.data.value.config.datasets?.length">
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
          v-for="dataset in useData.data.value.config.datasets"
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

    <!-- Back to uses link -->
    <v-row
      class="my-4"
      justify="center"
    >
      <nav-link
        :link="{
          type: 'standard',
          subtype: 'uses',
          title: t('backToUses'),
          icon: { custom: mdiChevronLeft }
        }"
        :config="portalConfig.navLinksConfig"
      />
    </v-row>
  </template>
</template>

<script setup lang="ts">
import type { Use } from '#api/types/use'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { mdiChevronLeft } from '@mdi/js'

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

const useData = await useFetch<Pick<Use, '_id' | 'slug' | 'config'>>(`/portal/api/uses/${slug}`, {
  watch: false
})

const errorTitle = computed(() => {
  const code = useData.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('useNotFound')
  return t('useError')
})

const getImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/uses/${slug}/images/${id}`
}

watch(() => useData.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'uses' },
    { title: useData.data.value?.config.title || t('use') }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (useData.data.value?.config.title || t('use')) + ' - ' + portalConfig.value.title,
  description: () => useData.data.value?.config.summary || portalConfig.value.description,
  ogType: 'article'
})
</script>

<i18n lang="yaml">
  en:
    backToUses: Back to Uses List
    use: Use
    useNotFound: The requested use was not found
    useError: An error occurred while loading the use
    visitLink: Visit link
    publishedBy: Published by {author}
    datasets: Linked datasets
  fr:
    backToUses: Retourner à la liste des réutilisations
    use: Réutilisation
    useNotFound: La réutilisation demandée n'a pas été trouvée
    useError: Une erreur est survenue lors du chargement de la réutilisation
    visitLink: Visiter le lien
    publishedBy: Publié par {author}
    datasets: Jeux de données associés
</i18n>
