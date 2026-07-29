<template>
  <v-alert
    v-if="errors.length"
    type="warning"
    density="compact"
    variant="tonal"
    class="mb-4"
    :title="t('title')"
  >
    <ul class="ml-4">
      <li
        v-for="error of errors"
        :key="error"
      >
        <code>{{ error }}</code>
      </li>
    </ul>
  </v-alert>
</template>

<script setup lang="ts">
// Lists the errors of the STORED page config that could not be healed when it was
// loaded. Errors introduced while editing are the responsibility of the form itself.
const { t } = useI18n()
const { errors } = defineProps<{ errors: string[] }>()
</script>

<i18n lang="yaml">
  en:
    title: The page configuration contains errors, the changes cannot be saved until they are fixed
  fr:
    title: La configuration de la page contient des erreurs, les modifications ne peuvent pas être enregistrées tant qu'elles ne sont pas corrigées
</i18n>
