<template>
  <v-app-bar
    ref="appBarRef"
    :density="headerConfig.density"
    flat
  >
    <v-container
      class="mx-2"
      fluid
    >
      <v-row align="center">
        <!-- Logo -->
        <layout-header-logo
          v-if="logo"
          :height="(appBarHeight || 64) - 10"
          :link="portalConfig.header.logoLink"
          :logo="logo"
        />

        <!-- Breadcrumbs -->
        <v-spacer />
        <v-breadcrumbs :items="[{ title: t('home'), to: '/' }, ...breadcrumbs]">
          <template #divider>
            <v-icon :icon="mdiChevronRight" />
          </template>
        </v-breadcrumbs>
        <v-spacer />

      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js'
import { useElementSize } from '@vueuse/core'

const { portalConfig } = usePortalStore()
const { breadcrumbs } = useNavigationStore()
const { t } = useI18n()

const appBarRef = ref()
const { height: appBarHeight } = useElementSize(appBarRef)

const headerConfig = computed(() => portalConfig.value.header)
const logo = computed(() => {
  if (headerConfig.value.logoPrimaryType === 'local' && headerConfig.value.logoPrimary) {
    return headerConfig.value.logoPrimary
  } else if (headerConfig.value.logoPrimaryType === 'default' && portalConfig.value.logo) {
    return portalConfig.value.logo
  }
  return null
})
</script>

<i18n lang="yaml">
  en:
    home: Home
  fr:
    home: Accueil
</i18n>
