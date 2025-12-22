<template>
  <d-frame-wrapper
    :iframe-title="`${t('events')} - ${portalTitle || ''}`"
    :src="`/events/embed/events?resource=${encodeURIComponent('portal/' + route.params.id)}`"
    class="fill-height"
    resize="no"
    sync-params
  />
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'

const { t } = useI18n()
const route = useRoute<'/portals/[id]/events'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)

const portalTitle = computed(() => portalFetch.data.value?.config.title ?? '')

watch(portalFetch.data, (portal) => {
  if (!portal) return
  setBreadcrumbs([
    { text: t('portals'), to: '/portals' },
    { text: portal.config.title, to: `/portals/${route.params.id}` },
    { text: t('events') }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    events: Events
    portals: Portals
  fr:
    events: Traçabilité
    portals: Portails
</i18n>
