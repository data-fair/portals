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
    filtersLocation: 'left',
    defaultSort: 'title',
    columns: 0,
    thumbnailLocation: 'none',
    cropThumbnails: false,
    showSummary: false,
    actionsLocation: 'none',
    metadataLocation: 'right',
    attachmentsLocation: 'action',
    showImage: false,
    showDepartment: false,
    actionsStyle: 'text'
  },
  applications: {
    filtersLocation: 'left',
    defaultSort: 'title',
    columns: 0,
    thumbnailLocation: 'left',
    cropThumbnails: false,
    showSummary: false,
    actionsLocation: 'none',
    metadataLocation: 'top',
    showImage: false,
    showDepartment: false,
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
