<template>
  <!-- TODO: Add main redirect ? -->
  <d-frame-wrapper
    :iframe-title="t('organization')"
    :src="`/simple-directory/organization/${session.account.value.id}?redirect=${encodeURIComponent(origin + '/me/account')}&main_redirect=${encodeURIComponent(origin + '/data-fair')}`"
  />
</template>

<script setup lang="ts">
const session = useSessionAuthenticated()
const { origin } = useRequestURL()
const { t } = useI18n()
useNavigationStore().clearBreadcrumbs()
useHead({ title: t('organization') })
</script>

<i18n lang="yaml">
  en:
    organization: My organization
  fr:
    organization: Mon organisation
</i18n>
