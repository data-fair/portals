<template>
  <!-- reset vjsf defaults -->
  <v-defaults-provider root>
    <v-theme-provider :theme="'preview-' + colorsKey">
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
          {{ t('preview') }}{{ appendTitle ? ' - ' + appendTitle : '' }}
        </v-card-title>
        <v-card-text :class="noPadding ? 'pa-0 bg-background' : 'pt-4 bg-background'">
          <slot />
        </v-card-text>
      </v-card>
    </v-theme-provider>
  </v-defaults-provider>
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
    },
    noPadding: {
      type: Boolean,
      default: false
    }
  }
)
</script>

<i18n lang="yaml">
  en:
    preview: Preview
  fr:
    preview: Aperçu
</i18n>
