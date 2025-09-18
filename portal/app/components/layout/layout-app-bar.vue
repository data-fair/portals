<template>
  <component
    :is="preview ? VToolbar : VAppBar"
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
      :portal-logo="portalConfig.logo"
      :portal-title="portalConfig.title"
      :social-links="portalConfig.socialLinks"
    />

    <!-- Navigation Bar (64px) -->
    <template #extension>
      <v-container
        class="mx-2"
        fluid
      >
        <v-row align="center">
          <layout-header-logo
            v-if="logo && !headerConfig.show"
            :height="56"
            :link="portalConfig.header.logoLink"
            :logo="logo"
          />

          <nav-tabs-or-menu
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
</template>

<script setup lang="ts">
import { VToolbar, VAppBar } from 'vuetify/components'

const { home } = defineProps<{ home?: boolean }>()
const { portalConfig, preview } = usePortalStore()

const headerConfig = computed(() => {
  if (!home || !portalConfig.value.headerHome?.active) return portalConfig.value.header
  return { ...portalConfig.value.header, ...portalConfig.value.headerHome.header }
})

const logo = computed(() => {
  if (headerConfig.value.logoPrimaryType === 'local' && headerConfig.value.logoPrimary) {
    return headerConfig.value.logoPrimary
  } else if (headerConfig.value.logoPrimaryType === 'default' && portalConfig.value.logo) {
    return portalConfig.value.logo
  }
  return null
})

</script>
