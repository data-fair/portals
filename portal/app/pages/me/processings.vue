<template>
  <d-frame-wrapper
    :iframe-title="t('processings')"
    :src="`/processings/processings/?owner=${portalOwner}`"
    :adapter.prop="stateChangeAdapter"
    class="fill-height"
    resize="no"
    sync-path="/me/processings/"
    sync-params
    emit-iframe-messages
    @iframe-message="(message: any) => onMessage(message.detail)"
    @message="(message: any) => onMessage(message.detail)"
  />
</template>

<script setup lang="ts">
import createStateChangeAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter'

const { t } = useI18n()
const { portal } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

const portalOwner = computed(() => {
  let owner = `${portal.value.owner.type}:${portal.value.owner.id}`
  if (portal.value.owner.department) owner += `:${portal.value.owner.department}`
  return owner
})

// Handle navigation from the iframe to the parent app
const stateChangeAdapter = createStateChangeAdapter(useRouter())

const onMessage = (message: { breadcrumbs?: { to?: string, text: string }[] }) => {
  if (!message.breadcrumbs) return
  const formattedBreadcrumbs = message.breadcrumbs
    .map(b => ({ title: b.text, to: b.to && '/me' + b.to }))
  setBreadcrumbs(formattedBreadcrumbs)
}

useHead({ title: t('processings') })
</script>

<i18n lang="yaml">
  en:
    processings: My processings
  fr:
    processings: Mes traitements
</i18n>
