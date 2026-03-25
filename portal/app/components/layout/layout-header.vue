<template>
  <v-container class="h-100 d-flex flex-column justify-center pb-0">
    <v-row
      v-if="headerConfig.showSocial"
      class="justify-end align-center"
      no-gutters
    >
      <social-links :links="portalConfig.socialLinks" />
    </v-row>
    <v-row class="align-center mt-0">
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

/**
 * Logo selection rules:
 * - If primary type is hidden: no logo.
 * - On mobile:
 *   - with title: use only logoPrimaryMobile (no fallback to primary logo)
 *   - without title: use logoPrimaryMobile, fallback to primary logo
 * - On desktop: use primary logo only.
 */
const logo = computed(() => {
  if (headerConfig.logoPrimaryType === 'hidden') return null

  const primaryLogo = headerConfig.logoPrimaryType === 'local'
    ? headerConfig.logoPrimary || null
    : headerConfig.logoPrimaryType === 'default'
      ? portalConfig.value.logo || null
      : null

  if (display.xs.value) {
    return headerConfig.logoPrimaryMobile || (headerConfig.showTitle ? null : primaryLogo)
  }

  return primaryLogo
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
    font-size: map.get(map.get(v.$typography, 'headline-small'), 'size');
    line-height: map.get(map.get(v.$typography, 'headline-small'), 'line-height');
    letter-spacing: map.get(map.get(v.$typography, 'headline-small'), 'letter-spacing');
  }

  @media #{map.get(v.$display-breakpoints, 'md-and-up')} {
    font-size: map.get(map.get(v.$typography, 'headline-medium'), 'size');
    line-height: map.get(map.get(v.$typography, 'headline-medium'), 'line-height');
    letter-spacing: map.get(map.get(v.$typography, 'headline-medium'), 'letter-spacing');
  }
}
</style>
