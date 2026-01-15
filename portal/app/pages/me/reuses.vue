<template>
  <d-frame-wrapper
    :iframe-title="t('myReuses')"
    :adapter.prop="stateChangeAdapter"
    src="/portals-manager/embed/reuses/"
    class="fill-height"
    resize="no"
    sync-path="/me/reuses/"
    sync-params
    emit-iframe-messages
    @iframe-message="(message: any) => onMessage(message.detail)"
    @message="(message: any) => onMessage(message.detail)"
  />
</template>

<script setup lang="ts">
import createStateChangeAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter'

const { t } = useI18n()
const { setBreadcrumbs } = useNavigationStore()

// Handle navigation from the iframe to the parent app
const stateChangeAdapter = createStateChangeAdapter(useRouter())

const onMessage = (message: { breadcrumbs?: { to?: string, text: string }[] }) => {
  if (!message.breadcrumbs) return
  const formattedBreadcrumbs = message.breadcrumbs
    .map(b => ({ title: b.text, to: b.to && '/me' + b.to }))
  setBreadcrumbs(formattedBreadcrumbs)
}

useHead({ title: t('myReuses') })
</script>

<i18n lang="yaml">
  en:
    myReuses: My reuses
  fr:
    myReuses: Mes réutilisations
</i18n>
