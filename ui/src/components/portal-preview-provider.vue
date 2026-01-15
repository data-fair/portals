<template>
  <slot />
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal-config'

const { portalConfig } = defineProps<{
  portalConfig?: PortalConfig
}>()

const { t } = useI18n()

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
    page: { datasets: { display: 'card' } }
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
  }
}

providePortalStore(portalConfig || portalConfigDefault)

</script>

<i18n lang="yaml">
  en:
    contactInfoExample: <strong>My address</strong></br>Peace Street</br>75000Paris, France

  fr:
    contactInfoExample: <strong>Mon adresse</strong></br>rue de la paix</br>75000 Paris, France

</i18n>
