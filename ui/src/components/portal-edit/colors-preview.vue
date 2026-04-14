<template>
  <preview :colors-key="colorsKey">
    <lib-colors-preview
      :colors-key="colorsKey"
      :theme="theme"
      :default-theme="defaultTheme"
      :dark="dark"
      :csp-nonce="$cspNonce"
    />
  </preview>
</template>

<script setup lang="ts">
import LibColorsPreview from '@data-fair/lib-vuetify/colors-preview.vue'
import type { Theme } from '@data-fair/lib-common-types/theme/index.js'
import { defaultTheme } from '@data-fair/lib-common-types/theme/index.js'

defineProps({
  colorsKey: { type: String as () => 'colors' | 'darkColors' | 'hcColors' | 'hcDarkColors', required: true },
  theme: { type: Object as () => Theme, required: true },
  dark: { type: Boolean, default: false }
})
</script>
