<template>
  <v-alert
    :title="t('title')"
    :text="t('text')"
    type="warning"
    variant="tonal"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()

// A page rendered without part of its content must not be indexed as is: a 503 tells the
// crawler to come back later. An error status already set by page-error is more specific,
// it wins. This runs at render time, when the fetches of the page have settled.
const event = useRequestEvent()
if (event && event.node.res.statusCode < 400) {
  setResponseStatus(event, 503)
  useResponseHeader('Retry-After').value = '60'
}
</script>

<i18n lang="yaml">
  en:
    title: Content temporarily unavailable
    text: This content could not be loaded, please try again in a few moments.
  fr:
    title: Contenu temporairement indisponible
    text: Ce contenu n'a pas pu être chargé, veuillez réessayer dans quelques instants.
</i18n>
