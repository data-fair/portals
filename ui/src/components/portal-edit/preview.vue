<template>
  <v-theme-provider
    :theme="'preview-' + colorsKey"
    with-background
  >
    <v-card
      density="compact"
      class="pa-0"
    >
      <v-card-title class="text-success">
        <v-icon
          :icon="mdiEye"
          class="me-2"
          size="small"
        />
        {{ t('preview') }}{{ appendTitle }}
      </v-card-title>
      <slot />
    </v-card>
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
    },
    appendTitle: {
      type: String,
      default: ''
    }
  }
)
</script>

<i18n lang="yaml">
  en:
    preview: preview
  fr:
    preview: aperçu
</i18n>
