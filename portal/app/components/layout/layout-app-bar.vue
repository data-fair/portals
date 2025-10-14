<template>
  <component
    :is="preview ? VToolbar : VAppBar"
    ref="appBarRef"
    :color="headerConfig.navBarColor"
    :class="headerConfig.transparent ? 'opacity-90' : undefined"
    :density="headerConfig.density"
    :extension-height="headerConfig.density === 'default' ? 64 : undefined"
    :height="headerConfig.show ? 128 : 0"
    :scroll-behavior="(headerConfig.scrollBehavior === 'hide' && !headerConfig.show ? 'default' : headerConfig.scrollBehavior) + ' elevate'"
  >
    <!-- Header (128px)-->
    <layout-header
      v-if="headerConfig.show"
      :header-config="headerConfig"
    />

    <!-- Navigation Bar (64px) -->
    <template #extension>
      <v-container
        fluid
        class="pa-0 h-100"
      >
        <v-row
          align="center"
          no-gutters
          class="h-100 flex-nowrap"
        >
          <layout-header-logo
            v-if="logo && !headerConfig.show"
            :height="(appBarHeight || 64) - 10"
            :link="portalConfig.header.logoLink"
            :logo="logo"
            class="pl-4"
          />

          <nav-tabs-or-drawer
            :navigation="portalConfig.menu.children"
            :density="headerConfig.density"
          />

          <v-spacer />
          <v-toolbar-items v-if="portalConfig.authentication !== 'none'">
            <notification-queue />
            <layout-personal-menu
              :show-header="headerConfig.show"
              :login-color="headerConfig.loginColor === 'navBar' ? headerConfig.navBarColor : headerConfig.loginColor"
            />
          </v-toolbar-items>
        </v-row>
      </v-container>
    </template>
  </component>
  <nav-drawer
    :navigation="portalConfig.menu.children"
    :density="headerConfig.density"
  />
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { VToolbar, VAppBar } from 'vuetify/components'
import { useElementSize } from '@vueuse/core'

const { home } = defineProps<{ home?: boolean }>()
const { portalConfig, preview } = usePortalStore()
const display = useDisplay()

const appBarRef = ref()
const { height: appBarHeight } = useElementSize(appBarRef)

const headerConfig = computed(() => {
  if (!home || !portalConfig.value.headerHome?.active) return portalConfig.value.header
  return { ...portalConfig.value.header, ...portalConfig.value.headerHome.header }
})

const logo = computed(() => {
  if (headerConfig.value.logoPrimaryType !== 'hidden' && display.xs.value) {
    if (headerConfig.value.logoPrimaryMobile) return headerConfig.value.logoPrimaryMobile
    else return null
  } else if (headerConfig.value.logoPrimaryType === 'local' && headerConfig.value.logoPrimary) {
    return headerConfig.value.logoPrimary
  } else if (headerConfig.value.logoPrimaryType === 'default' && portalConfig.value.logo) {
    return portalConfig.value.logo
  }
  return null
})

</script>
