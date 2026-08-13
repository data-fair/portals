<template>
  <!-- the embedded document starts its titles at h2: the h1 of the page belongs here -->
  <h1 class="d-sr-only">
    {{ t('myAccount') }}
  </h1>

  <d-frame-wrapper
    :iframe-title="t('myAccount')"
    src="/simple-directory/me"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
useNavigationStore().clearBreadcrumbs()
useHead({ title: t('myAccount') })
</script>

<i18n lang="yaml">
  en:
    myAccount: My account
  fr:
    myAccount: Mon compte
</i18n>
