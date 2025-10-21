<template>
  <v-theme-provider
    :theme="'preview-' + colorsKey"
    with-background
  >
    <v-alert
      variant="outlined"
      color="info"
    >
      <h2 class="text-h6 mb-2">
        <v-icon
          :icon="mdiEye"
          class="me-2"
        />
        {{ t('preview') }}
      </h2>
      <slot />
    </v-alert>
  </v-theme-provider>
</template>

<script setup lang="ts">
import { mdiEye } from '@mdi/js'

const { t } = useI18n()

defineProps(
  {
    colorsKey: {
      type: String,
      default: 'colors',
    }
  }
)
</script>

<i18n lang="yaml">
  en:
    preview: preview
  fr:
    preview: Aperçu
</i18n>
