<template>
  <component
    :is="detached ? VToolbar : VAppBar"
    :color="headerConfig.navBarColor"
    :density="headerConfig.density"
    :extension-height="headerConfig.density === 'default' ? 64 : undefined"
    :height="headerConfig.show ? 128 : 0"
    scroll-behavior="hide"
  >
    <!-- Header (128px)-->
    <layout-header
      v-if="headerConfig.show"
      :header-config="headerConfig"
      :portal-logo="portalConfig.logo"
      :portal-title="portalConfig.title"
      :social-links="portalConfig.socialLinks"
    />

    <!-- Navigation Bar (64px) -->
    <template #extension>
      <v-container
        class="px-6"
        fluid
      >
        <v-row align="center">
          <layout-header-logo
            v-if="logo && !headerConfig.show"
            :logo="logo"
            :link="portalConfig.header.logoLink"
            :height="56"
          />

          <nav-tabs-or-menu
            :navigation="portalConfig.menu.children"
            :density="headerConfig.density"
          />

          <v-spacer />
          <v-toolbar-items>
            <notification-queue :detached="detached" />
            <layout-personal-menu
              :show-header="headerConfig.show"
              :login-color="headerConfig.loginColor === 'navBar' ? headerConfig.navBarColor : headerConfig.loginColor"
              :detached="detached"
            />
          </v-toolbar-items>
        </v-row>
      </v-container>
    </template>
  </component>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'
import { VToolbar, VAppBar } from 'vuetify/components'

const { portalConfig, home } = defineProps({
  portalConfig: { type: Object as () => PortalConfig, required: true },
  home: { type: Boolean, default: false },
  detached: { type: Boolean, default: false }
})

const headerConfig = computed(() => {
  if (!home || !portalConfig.headerHome?.active) return portalConfig.header
  return { ...portalConfig.header, ...portalConfig.headerHome.header }
})

const logo = computed(() => {
  if (headerConfig.value.logoPrimaryType === 'local' && headerConfig.value.logoPrimary) {
    return headerConfig.value.logoPrimary
  } else if (headerConfig.value.logoPrimaryType === 'default' && portalConfig.logo) {
    return portalConfig.logo
  }
  return null
})

</script>
