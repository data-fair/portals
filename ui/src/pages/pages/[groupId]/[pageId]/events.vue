<template>
  <d-frame-wrapper
    :iframe-title="`${t('events')} - ${page?.title}}`"
    :src="`/events/embed/events?resource=${encodeURIComponent('page/' + route.params.pageId)}`"
    class="fill-height"
    resize="no"
    sync-params
  />
</template>

<script setup lang="ts">

const { t } = useI18n()
const { page } = usePageStore()
const route = useRoute<'/pages/[groupId]/[pageId]/events'>()

const groupTitle = computed(() => {
  if (!page.value) return ''
  if (page.value.type === 'generic' && page.value.config.genericMetadata?.group) return page.value.config.genericMetadata.group.title
  return t('groupTitle.' + route.params.groupId)
})

watch(page, (page) => {
  if (!page) return
  setBreadcrumbs([
    { text: t('pages'), to: '/pages' },
    { text: groupTitle.value, to: `/pages/${route.params.groupId}` },
    { text: page.title, to: `/pages/${route.params.groupId}/${route.params.pageId}` },
    { text: t('events') }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    events: Events
    groupTitle:
      default: Other pages
      event: Events
      news: News
      standard: Standard pages
    pages: Pages
  fr:
    events: Traçabilité
    groupTitle:
      default: Autres pages
      event: Événements
      news: Actualités
      standard: Pages standard
    pages: Pages
</i18n>
