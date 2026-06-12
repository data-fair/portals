<template>
  <!--
    div: Background color always full width
    fluid: for compatibility, default to true (even if undefined).
           It is only false when explicitly set to false.
  -->
  <div
    :class="`bg-${navBarConfig.color}`"
    class="w-100 h-100"
  >
    <v-container
      :fluid="navBarConfig.fluid !== false"
      :class="{ 'px-4': navBarConfig.fluid === false }"
      class="pa-0 h-100"
    >
      <v-row
        no-gutters
        class="h-100 flex-nowrap align-center"
      >
        <layout-header-logo
          v-if="logo"
          :height="(appBarHeight || 64) - 10"
          :link="navBarConfig.logoLink"
          :logo="logo"
          class="pl-4"
        />

        <nav-tabs-or-drawer
          :navigation="portalConfig.menu.children"
          :nav-bar-config="navBarConfig"
        />

        <v-spacer />

        <div id="agent-chat-appbar" class="d-flex align-center" />

        <v-toolbar-items v-if="portalConfig.authentication !== 'none'">
          <v-btn
            v-if="preview"
            :title="t('openNotificationList')"
            stacked
          >
            <v-badge
              :content="3"
              color="warning"
            >
              <v-icon :icon="mdiBell" />
            </v-badge>
          </v-btn>
          <df-notification-queue
            v-else
            events-url="/events"
          />
          <layout-personal-menu
            :login-color="navBarConfig.loginColor"
            :nav-bar-color="navBarConfig.color"
          />
        </v-toolbar-items>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import type { NavBar } from '#api/types/portal-config'
import { DfNotificationQueue } from '@data-fair/lib-vuetify-events'
import { useDisplay } from 'vuetify'
import { useElementSize } from '@vueuse/core'
import { mdiBell } from '@mdi/js'

const { navBarConfig } = defineProps<{
  navBarConfig: NavBar
}>()

const { portalConfig, preview } = usePortalStore()
const display = useDisplay()
const { t } = useI18n()

const appBarRef = ref()
const { height: appBarHeight } = useElementSize(appBarRef)

const logo = computed(() => {
  if (navBarConfig.logoType !== 'hidden' && display.xs.value) {
    if (navBarConfig.logoMobile) return navBarConfig.logoMobile
    else return null
  } else if (navBarConfig.logoType === 'local' && navBarConfig.logo) {
    return navBarConfig.logo
  } else if (navBarConfig.logoType === 'default' && portalConfig.value.logo) {
    return portalConfig.value.logo
  }
  return null
})

</script>

<i18n lang="yaml">
  en:
    openNotificationList: "Open notification list"
  fr:
    openNotificationList: "Ouvrir la liste des notifications"
</i18n>
