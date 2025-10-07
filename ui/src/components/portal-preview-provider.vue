<template>
  <slot />
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal-config'

const { portalConfig } = defineProps<{
  portalConfig?: PortalConfig
}>()

const { t } = useI18n()

const portalConfigDefault: PortalConfig = {
  datasets: {
    cardsLayout: 'medium',
    filtersLayout: 'top',
    defaultSort: 'createdAt',
    showActions: true,
    cropThumbnails: true,
    metadataPosition: 'right',
    showImage: true,
    actionsStyle: 'full'
  },
  applications: {
    cardsLayout: 'vertical',
    filtersLayout: 'top',
    defaultSort: 'createdAt',
    showActions: true,
    cropThumbnails: true,
    metadataPosition: 'right',
    showImage: false,
    actionsStyle: 'full'
  },
  socialShares: ['bluesky', 'x', 'facebook', 'linkedin', 'reddit', 'sms', 'whatsapp'],
  contactInformations: {
    infos: t('contactInfoExample'),
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
