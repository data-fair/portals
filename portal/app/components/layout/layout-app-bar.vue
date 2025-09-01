<template>
  <component
    :is="detached ? VToolbar : VAppBar"
    :color="headerConfig.navBarColor"
    :density="headerConfig.density"
    :extension-height="headerConfig.density === 'default' ? 64 : undefined"
    :height="headerConfig.hidden ? 0 : 128"
    scroll-behavior="hide"
  >
    <!-- Header (128px)-->
    <layout-header
      v-if="!headerConfig.hidden"
      :portal-config="portalConfig"
    />

    <!-- Navigation Bar (64px) -->
    <template #extension>
      <v-container
        class="px-6"
        fluid
      >
        <v-row align="center">
          <template
            v-if="
              headerConfig.logoPrimaryType !== 'hidden'
              && (headerConfig.hidden || $vuetify.display.xs)
            "
          >
            <layout-header-logo
              v-if="headerConfig.logoPrimaryType === 'local' && headerConfig.logoPrimary"
              :logo="headerConfig.logoPrimary"
              :link="portalConfig.header.logoLink"
              :height="56"
            />
            <layout-header-logo
              v-else-if="portalConfig.logo"
              :logo="portalConfig.logo"
              :link="portalConfig.header.logoLink"
              :height="56"
            />
          </template>

          <nav-tabs-or-menu
            :menu="portalConfig.menu"
            :density="headerConfig.density"
          />

          <v-spacer />
          <v-toolbar-items>
            <v-btn
              title="Ouvrir la liste des notifications"
              variant="text"
              :icon="mdiBell"
              tile
            />
            <v-btn
              variant="text"
              tile
            >
              Se connecter
            </v-btn>
          </v-toolbar-items>
        </v-row>
      </v-container>
    </template>
  </component>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'
import { VToolbar, VAppBar } from 'vuetify/components'
import { mdiBell } from '@mdi/js'

const { portalConfig, home } = defineProps({
  portalConfig: { type: Object as () => PortalConfig, required: true },
  home: { type: Boolean, default: false },
  detached: { type: Boolean, default: false }
})

const headerConfig = computed(() => {
  if (!home || !portalConfig.headerHome?.active) return portalConfig.header
  return { ...portalConfig.header, ...portalConfig.headerHome.header }
})

</script>
