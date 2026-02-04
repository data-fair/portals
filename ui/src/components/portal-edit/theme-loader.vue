<template>
  <component
    :is="'style'"
    v-if="colors"
    :nonce="$cspNonce"
  >
    {{ getTextColorsCss(colors, themeKey) }}
  </component>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { Colors } from '@data-fair/lib-common-types/theme/index.js'
import { defaultTheme, fillTheme, getTextColorsCss } from '@data-fair/lib-common-types/theme/index.js'

const vuetifyTheme = useTheme()
const { portalConfig } = usePortalStore()

const themeKey = 'preview-colors'

const fullTheme = computed(() => {
  if (!portalConfig.value?.theme) return null
  return fillTheme(portalConfig.value.theme, defaultTheme)
})

const colors = computed(() => fullTheme.value?.colors)

watch(fullTheme, () => {
  if (!fullTheme.value) return
  const themeColors = fullTheme.value.colors
  if (vuetifyTheme.themes.value[themeKey]) {
    for (const color of Object.keys(vuetifyTheme.themes.value[themeKey].colors)) {
      if (themeColors[color as keyof Colors] === undefined) delete vuetifyTheme.themes.value[themeKey].colors[color]
    }
    Object.assign(vuetifyTheme.themes.value[themeKey].colors, themeColors)
  } else {
    vuetifyTheme.themes.value[themeKey] = {
      dark: false,
      colors: themeColors,
      variables: vuetifyTheme.themes.value.light.variables
    }
  }
}, { immediate: true })
</script>
