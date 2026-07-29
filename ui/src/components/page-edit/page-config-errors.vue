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
import type { PageConfig } from '#api/types/page/index.ts'
import type { ErrorObject } from 'ajv'
import { validate as validatePageConfig } from '#api/types/page-config/index.ts'

const { t } = useI18n()
const { config } = defineProps<{ config: PageConfig | undefined }>()

// the config was healed of removable properties when it was loaded, the remaining
// errors cannot be fixed automatically and the form does not display the ones carried
// by page elements, but they block the draft saves, so they must be listed here
const errors = computed(() => {
  if (!config) return []
  const clone = structuredClone(toRaw(config))
  if (validatePageConfig(clone)) return []
  const validationErrors = (validatePageConfig as unknown as { errors?: ErrorObject[] | null }).errors ?? []
  return [...new Set(validationErrors.map(error => `${error.instancePath} ${error.message}`))]
})
</script>

<i18n lang="yaml">
  en:
    title: The page configuration contains errors, the changes cannot be saved until they are fixed
  fr:
    title: La configuration de la page contient des erreurs, les modifications ne peuvent pas être enregistrées tant qu'elles ne sont pas corrigées
</i18n>
