<template>
  <v-theme-provider
    v-if="themeColors"
    :theme="themeKey"
  >
    <component
      :is="'style'"
      :nonce="$cspNonce"
    >
      {{ getTextColorsCss(themeColors, themeKey) }}
    </component>
    <slot />
  </v-theme-provider>
  <slot v-else />
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal-config'
import type { Ref } from 'vue'
import { useTheme } from 'vuetify'
import type { Colors } from '@data-fair/lib-common-types/theme/index.js'
import { defaultTheme, fillTheme, getTextColorsCss } from '@data-fair/lib-common-types/theme/index.js'

const { t } = useI18n()
const vuetifyTheme = useTheme()

const themeKey = 'page-preview'

let previewPortalConfig: Ref<PortalConfig | undefined>
try {
  const previewPortal = usePreviewPortal()
  previewPortalConfig = previewPortal.previewPortalConfig
} catch {
  previewPortalConfig = ref(undefined)
}

// @ts-ignore
const portalConfigDefault: PortalConfig = {
  datasets: {
    card: {},
    page: {}
  },
  applications: {
    card: {},
    page: {}
  },
  reuses: {
    card: {},
    page: {
      datasets: { display: 'card' },
      showImage: true
    }
  },
  socialShares: ['bluesky', 'x', 'facebook', 'linkedin', 'reddit', 'sms', 'whatsapp'],
  contactInformations: {
    infos: t('contactInfoExample'),
    infos_html: t('contactInfoExample'),
    phone: '0123456789',
    phoneLabel: 'Phone',
    website: 'https://example.com',
    websiteLabel: 'Website'
  },
  socialLinks: {
    bluesky: 'example',
    linkedin: 'example'
  },
  personal: {
    navigationColor: 'primary',
    hidePages: [],
    accountPages: []
  },
  breadcrumb: {
    compact: true,
    showHome: true,
    fluid: false,
    separator: {
      type: 'text',
      text: '/'
    }
  },
  navLinksConfig: {
    showIcon: true
  }
}

const activeConfig = computed(() => previewPortalConfig.value || portalConfigDefault)

const store = providePortalStore(activeConfig.value)

// update the provided store reactively when the selected portal changes
watch(activeConfig, (newConfig) => {
  store.portalConfig.value = newConfig
})

// theme management
const fullTheme = computed(() => {
  const config = activeConfig.value
  if (!config?.theme) return null
  return fillTheme(config.theme, defaultTheme)
})

const themeColors = computed(() => fullTheme.value?.colors)

watch(fullTheme, () => {
  if (!fullTheme.value) return
  const colors = fullTheme.value.colors
  if (vuetifyTheme.themes.value[themeKey]) {
    for (const color of Object.keys(vuetifyTheme.themes.value[themeKey].colors)) {
      if (colors[color as keyof Colors] === undefined) delete vuetifyTheme.themes.value[themeKey].colors[color]
    }
    Object.assign(vuetifyTheme.themes.value[themeKey].colors, colors)
  } else {
    vuetifyTheme.themes.value[themeKey] = {
      dark: false,
      colors,
      variables: vuetifyTheme.themes.value.light.variables
    }
  }
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    contactInfoExample: <strong>My address</strong></br>Peace Street</br>75000Paris, France

  fr:
    contactInfoExample: <strong>Mon adresse</strong></br>rue de la paix</br>75000 Paris, France

</i18n>
