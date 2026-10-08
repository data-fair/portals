<template>
  <div class="text-caption text-medium-emphasis px-2 py-1">
    {{ t('paused') }}
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<i18n lang="yaml">
  en:
    paused: Preview of the last valid state, an item of the form is incomplete.
  fr:
    paused: Aperçu du dernier état valide, un élément du formulaire est incomplet.
</i18n>
