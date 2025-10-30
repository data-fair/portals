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
  <preview :colors-key="colorsKey">
    <component
      :is="'style'"
      v-if="colors"
      :nonce="$cspNonce"
    >
      {{ getTextColorsCss(colors, 'preview-' + colorsKey) }}
    </component>

    <v-row dense>
      <v-col>
        <v-card
          :title="t('cardExample.title')"
          :text="t('cardExample.text')"
          class="my-2"
        />
      </v-col>
      <v-col>
        <v-card
          :title="t('cardExample.title')"
          :text="t('cardExample.textInverse')"
          class="my-2"
          color="surface-inverse"
        />
      </v-col>
    </v-row>
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
  </preview>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { VBtn } from 'vuetify/components/VBtn'
import type { Colors, Theme } from '@data-fair/lib-common-types/theme/index.js'
import { mdiEmoticonKissOutline } from '@mdi/js'
import { defaultTheme, fillTheme, getTextColorsCss, getColorsWarnings, readableOptions, hcReadableOptions } from '@data-fair/lib-common-types/theme/index.js'

const { t } = useI18n()
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

<i18n lang="yaml">
  en:
    cardExample:
      title: Card example
      text: Surface color.
      textInverse: Inverse surface color.

  fr:
    cardExample:
      title: Une carte
      text: Couleur des surfaces.
      textInverse: Couleur inversée des surfaces.

</i18n>
