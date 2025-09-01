<template>
  <v-container
    :class="portalConfig.header.headerColor === 'background' ? 'bg-background h-100' : 'h-100'"
    fluid
  >
    <v-row class="mb-0">
      <v-spacer />
      <div>Social links</div>
    </v-row>
    <v-row align="center">
      <layout-header-logo
        v-if="portalConfig.logo && !$vuetify.display.xs"
        :logo="portalConfig.logo"
        :link="portalConfig.header.logoLink"
      />
      <v-spacer v-if="portalConfig.header.noTitle" />
      <v-col
        v-else
        class="text-center"
      >
        <h1 :class="`${$vuetify.display.smAndDown ? 'text-h5' : 'text-h4'} font-weight-bold`">
          {{ portalConfig.title }}
        </h1>
      </v-col>
      <layout-header-logo
        v-if="portalConfig.header.logoSecondary && !$vuetify.display.mdAndDown"
        :logo="portalConfig.header.logoSecondary"
        :link="portalConfig.header.logoSecondaryLink"
        is-secondary
      />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'

defineProps<{
  portalConfig: PortalConfig
}>()

</script>
