<template>
  <custom-router-link :to="`/portals/${portal._id}`">
    <v-card
      class="h-100"
      link
    >
      <v-card-item class="text-primary">
        <template #title>
          <span class="font-weight-bold">
            {{ portal.config.title }}
          </span>
          <v-tooltip
            v-if="portal.config.title.length > 20"
            activator="parent"
            location="top left"
            open-delay="300"
            :text="portal.config.title"
          />
        </template>

        <!-- Owner -->
        <template #append>
          <owner-avatar
            v-if="showOwner"
            :owner="portal.owner"
          />
        </template>
      </v-card-item>
      <v-divider />
      <v-card-text class="pa-0">
        <v-list
          density="compact"
          style="background-color: inherit;"
        >
          <!-- Domain name -->
          <v-list-item v-if="portal.ingress?.url">
            <template #prepend>
              <v-icon :icon="mdiWeb" />
            </template>
            {{ portal.ingress.url.replace(/^https?:\/\//, '') }}
          </v-list-item>

          <!-- Private / Public -->
          <v-list-item v-if="portal.config.authentication === 'required'">
            <template #prepend>
              <v-icon :icon="mdiLock" />
            </template>
            {{ t('private') }}
          </v-list-item>
          <v-list-item v-else>
            <template #prepend>
              <v-icon :icon="mdiLockOpen" />
            </template>
            {{ t('public') }}
          </v-list-item>

          <!-- Description (wrapped after 2 lines)-->
          <v-list-item v-if="portal.config.description">
            <v-list-item-title class="text-two-lines">
              {{ portal.config.description }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </custom-router-link>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'
import { mdiWeb, mdiLockOpen, mdiLock } from '@mdi/js'

defineProps({
  portal: {
    type: Object as () => Portal,
    default: null
  },
  showOwner: Boolean
})

const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    private: Private
    public: Public
  fr:
    private: Privé
    public: Public
</i18n>
