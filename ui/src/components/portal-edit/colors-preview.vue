<template>
  <v-alert
    v-for="(warning, i) of colorsWarnings"
    :key="i"
    type="warning"
    variant="outlined"
    class="mb-2"
  >
    {{ warning }}
  </v-alert>
  <v-theme-provider
    :theme="'preview-' + colorsKey"
    with-background
  >
    <component
      :is="'style'"
      v-if="colors"
    >
      {{ getTextColorsCss(colors, 'preview-' + colorsKey) }}
    </component>
    <v-container fluid>
      <h2 class="text-h6">
        Aperçu du rendu des couleurs
      </h2>
      <v-card
        title="Un exemple de carte"
        class="my-2"
      >
        <v-card-text>
          Elle utilise la couleur des "surfaces".
        </v-card-text>
      </v-card>
      <template
        v-for="color of colorKeys"
        :key="color"
      >
        <v-row class="ma-0">
          <template
            v-for="variant of buttonVariants"
            :key="variant"
          >
            <v-btn
              :color="color"
              :variant="variant"
              class="ma-2"
            >
              {{ color }}
            </v-btn>
          </template>
          <v-icon
            :icon="mdiEmoticonKissOutline"
            :color="color"
            class="ma-2"
          />
        </v-row>
      </template>
    </v-container>
  </v-theme-provider>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { VBtn } from 'vuetify/components/VBtn'
import type { Colors, Theme } from '@data-fair/lib-common-types/theme/index.js'
import { mdiEmoticonKissOutline } from '@mdi/js'
import { defaultTheme, fillTheme, getTextColorsCss, getColorsWarnings, readableOptions, hcReadableOptions } from '@data-fair/lib-common-types/theme/index.js'

const vuetifyTheme = useTheme()
const { colorsKey, theme, dark } = defineProps({
  colorsKey: { type: String as () => 'colors' | 'darkColors' | 'hcColors' | 'hcDarkColors', required: true },
  theme: { type: Object as () => Theme, required: true },
  dark: { type: Boolean, default: false }
})

const fullTheme = computed(() => {
  return fillTheme(theme, defaultTheme)
})

const colors = computed(() => fullTheme.value?.[colorsKey])

watch(fullTheme, () => {
  if (!fullTheme.value) return
  const key = 'preview-' + colorsKey
  const colors = fullTheme.value[colorsKey]
  if (vuetifyTheme.themes.value[key]) {
    for (const color of Object.keys(vuetifyTheme.themes.value[key].colors)) {
      if (colors[color as keyof Colors] === undefined) delete vuetifyTheme.themes.value[key].colors[color]
    }
    Object.assign(vuetifyTheme.themes.value[key].colors, colors)
  } else {
    vuetifyTheme.themes.value[key] = { dark, colors, variables: dark ? vuetifyTheme.themes.value.dark.variables : vuetifyTheme.themes.value.light.variables }
  }
}, { immediate: true })

const buttonVariants: VBtn['variant'][] = ['flat', 'text']
const colorKeys = ['primary', 'secondary', 'accent', 'info', 'success', 'error', 'warning']

const themeNames = {
  colors: 'default',
  darkColors: 'dark',
  hcColors: 'hc',
  hcDarkColors: 'hcDark'
}

const colorsWarnings = computed(() => {
  return getColorsWarnings('fr', colors.value, themeNames[colorsKey], colorsKey.startsWith('hc') ? hcReadableOptions : readableOptions)
})
</script>
