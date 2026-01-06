<template>
  <v-container class="h-100 d-flex flex-column justify-center pb-0 container">
    <v-row
      v-if="headerConfig.showSocial"
      class="ma-0"
    >
      <v-spacer />
      <social-links :links="portalConfig.socialLinks" />
    </v-row>
    <v-row
      align="center"
      class="ma-0"
    >
      <layout-header-logo
        v-if="logo"
        :logo="logo"
        :link="headerConfig.logoPrimaryLink"
      />
      <v-spacer v-if="!headerConfig.showTitle" />
      <v-col
        v-else
        class="text-center"
      >
        <h1 class="font-weight-bold portal-title">
          {{ portalConfig.title }}
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
import type { Header } from '#api/types/portal-config'
import { useDisplay } from 'vuetify'

const { headerConfig } = defineProps<{ headerConfig: Header }>()

const { portalConfig } = usePortalStore()
const display = useDisplay()

const logo = computed(() => {
  if (headerConfig.logoPrimaryType !== 'hidden' && display.xs.value) {
    if (headerConfig.logoPrimaryMobile) return headerConfig.logoPrimaryMobile
    else return null
  } else if (headerConfig.logoPrimaryType === 'local' && headerConfig.logoPrimary) {
    return headerConfig.logoPrimary
  } else if (headerConfig.logoPrimaryType === 'default' && portalConfig.value.logo) {
    return portalConfig.value.logo
  }
  return null
})

</script>

<!--
SSR Issue with useDisplay():
When using useDisplay() to conditionally render elements in SSR mode, there is a flickering effect during page load:
1. The page is first rendered server-side with default sizes
2. When the client-side JS loads, the page resizes based on actual viewport dimensions
3. This creates a visible flash/flicker for the user
4. Additionally, sometimes the reactive classes are not properly updated

Solution:
To ensure correct sizing from initial page load without flickering, we use Sass media queries
based on Vuetify's Sass variables instead of relying on reactive useDisplay() composable.
This way, the correct styles are applied server-side from the start.
-->
<style lang="scss">
@use 'sass:map';
@use 'vuetify/settings' as v;

// Responsive font size for portal title based on Vuetify typography settings
.portal-title {
  @media #{map.get(v.$display-breakpoints, 'sm-and-down')} {
    font-size: map.get(map.get(v.$typography, 'h5'), 'size');
    line-height: map.get(map.get(v.$typography, 'h5'), 'line-height');
    letter-spacing: map.get(map.get(v.$typography, 'h5'), 'letter-spacing');
  }

  @media #{map.get(v.$display-breakpoints, 'md-and-up')} {
    font-size: map.get(map.get(v.$typography, 'h4'), 'size');
    line-height: map.get(map.get(v.$typography, 'h4'), 'line-height');
    letter-spacing: map.get(map.get(v.$typography, 'h4'), 'letter-spacing');
  }
}
</style>
