<template>
  <d-frame-wrapper
    :iframe-title="t('myAccount')"
    src="/simple-directory/me"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({ title: t('myAccount') })
</script>

<i18n lang="yaml">
  en:
    myAccount: My account
  fr:
    myAccount: Mon compte
</i18n>
