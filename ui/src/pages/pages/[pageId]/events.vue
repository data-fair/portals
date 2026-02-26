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
const route = useRoute<'/pages/[pageId]/events'>()

watch(page, (page) => {
  if (!page) return
  setBreadcrumbs([
    { text: t('pages'), to: '/pages' },
    { text: page.title, to: `/pages/${route.params.pageId}` },
    { text: t('events') }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    events: Events
    pages: Pages
  fr:
    events: Traçabilité
    pages: Pages
</i18n>
