<template>
  <!-- TODO: Redirect to the true back-office -->
  <d-frame-wrapper
    :iframe-title="t('organization')"
    :src="`/simple-directory/organization/${session.account.value.id}?redirect=${encodeURIComponent(url.origin + '/me/account')}&main_redirect=${encodeURIComponent(url.origin + '/data-fair')}`"
  />
</template>

<script setup lang="ts">
const session = useSessionAuthenticated()
const url = useRequestURL()
const { t } = useI18n()
useHead({ title: t('organization') })
</script>

<i18n lang="yaml">
  en:
    organization: My organization
  fr:
    organization: Mon organisation
</i18n>
