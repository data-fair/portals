<template>
  <component
    :is="preview ? VToolbar : VAppBar"
    density="comfortable"
    flat
  >
    <!-- If mobile, show menu to open navigation drawer -->
    <v-btn
      v-if="$vuetify.display.smAndDown"
      variant="text"
      :icon="personalDrawer ? mdiMenuOpen : mdiMenu"
      :title="t('openNavigationMenu')"
      @click="personalDrawer = !personalDrawer"
    />
    <v-breadcrumbs :items="breadcrumbs" />

    <v-spacer />
    <div id="agent-chat-appbar" class="d-flex align-center" />
    <v-toolbar-items>
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

      <!-- Personal Menu -->
      <layout-personal-menu personal />
    </v-toolbar-items>
  </component>
</template>

<script setup lang="ts">
import { VToolbar, VAppBar } from 'vuetify/components'
import { DfNotificationQueue } from '@data-fair/lib-vuetify-events'
import { mdiBell, mdiMenu, mdiMenuOpen } from '@mdi/js'

const { preview } = usePortalStore()
const { personalDrawer, breadcrumbs } = useNavigationStore()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    openNavigationMenu: "Open navigation menu"
    openNotificationList: "Open notification list"
  fr:
    openNavigationMenu: "Ouvrir le menu de navigation"
    openNotificationList: "Ouvrir la liste des notifications"
</i18n>
