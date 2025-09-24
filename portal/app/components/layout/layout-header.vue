<template>
  <v-container
    :class="[
      headerConfig.headerColor === 'background' && 'bg-background',
      'h-100 d-flex flex-column justify-center pb-0'
    ]"
  >
    <v-row
      v-if="headerConfig.showSocial"
      class="ma-0"
    >
      <v-spacer />
      <social-links :links="socialLinks" />
    </v-row>
    <v-row align="center" class="ma-0">
      <layout-header-logo
        v-if="logo"
        :logo="logo"
        :link="headerConfig.logoLink"
      />
      <v-spacer v-if="!headerConfig.showTitle" />
      <v-col v-else class="text-center">
        <h1 :class="`${$vuetify.display.smAndDown ? 'text-h5' : 'text-h4'} font-weight-bold`">
          {{ portalTitle }}
        </h1>
      </v-col>
      <layout-header-logo
        v-if="headerConfig.logoSecondary && !$vuetify.display.mdAndDown"
        :logo="headerConfig.logoSecondary"
        :link="headerConfig.logoSecondaryLink"
        is-secondary
      />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'

const { headerConfig, portalLogo } = defineProps<{
  headerConfig: PortalConfig['header']
  portalTitle: PortalConfig['title']
  portalLogo: PortalConfig['logo']
  socialLinks: PortalConfig['socialLinks']
}>()

const logo = computed(() => {
  if (headerConfig.logoPrimaryType === 'local' && headerConfig.logoPrimary) {
    return headerConfig.logoPrimary
  } else if (headerConfig.logoPrimaryType === 'default' && portalLogo) {
    return portalLogo
  }
  return null
})

</script>
