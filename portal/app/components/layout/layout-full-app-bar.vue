<template>
  <v-app-bar
    ref="appBarRef"
    flat
  >
    <v-container
      class="mx-2"
      fluid
    >
      <v-row align="center">
        <!-- Logo -->
        <layout-header-logo
          v-if="portalConfig.logo"
          :height="(appBarHeight || 64) - 10"
          :logo="portalConfig.logo"
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

</script>

<i18n lang="yaml">
  en:
    home: Home
  fr:
    home: Accueil
</i18n>
