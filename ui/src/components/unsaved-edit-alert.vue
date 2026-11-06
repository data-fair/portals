<template>
  <v-alert
    :text="t('unsaved')"
    class="mx-2 mb-2 text-body-small"
    density="compact"
    type="warning"
    variant="tonal"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<i18n lang="yaml">
  en:
    unsaved: Last change not saved, a field is empty or invalid (shown in red).
  fr:
    unsaved: Dernière modification non enregistrée, un champ est vide ou mal renseigné (signalé en rouge).
</i18n>
