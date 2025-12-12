<template>
  <d-frame-wrapper
    :iframe-title="`${t('application')} - ${applicationFetch.data.value?.title} - ${t('fullscreen')}`"
    :src="`/data-fair/app/${$route.params.ref}?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
    class="fill-height"
    resize="no"
    sync-params
  />
</template>

<script setup lang="ts">
import { withQuery } from 'ufo'

definePageMeta({ layout: 'full' })

const { setBreadcrumbs } = useNavigationStore()
const { portalConfig } = usePortalStore()
const { t } = useI18n()
const route = useRoute()

const applicationFetch = useLocalFetch<{
  title: string
  summary?: string
  description?: string
  image?: string
  href: string
  updatedAt: string
  topics: { id: string; title: string; color: string }[]
}>(`/data-fair/api/v1/applications/${route.params.ref}`)

const getPortalImageSrc = (imageRef: { _id: string, mobileAlt?: string }, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

const thumbnailUrl = computed(() => {
  const cardConfig = portalConfig.value.applications.card
  const application = applicationFetch.data.value
  if (!cardConfig.thumbnail?.show || !application) return undefined
  if (application.image) return application.image
  if (cardConfig.thumbnail.useTopic && application.topics?.[0]?.id) {
    const topicConfig = portalConfig.value.topics?.find((t) => t.id === application!.topics[0]!.id)
    if (topicConfig?.thumbnail) return getPortalImageSrc(topicConfig.thumbnail, false)
  }
  return `${application.href}/capture?updatedAt=${application.updatedAt}`
})

watch(applicationFetch.data, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'applications' },
    { title: applicationFetch.data.value?.title || t('application'), to: withQuery('/applications/' + route.params.ref, route.query) },
    { title: t('fullscreen') }
  ])
}, { immediate: true })

usePageSeo({
  title: () => applicationFetch.data.value?.title || t('application'),
  description: () => applicationFetch.data.value?.summary,
  ogImage: () => thumbnailUrl.value
})

onMounted(() => window.parent.postMessage(['df-child', 'reinit-height'], '*'))
</script>

<i18n lang="yaml">
  en:
    application: Application
    fullscreen: Fullscreen
  fr:
    application: Visualisation
    fullscreen: Plein écran
</i18n>
