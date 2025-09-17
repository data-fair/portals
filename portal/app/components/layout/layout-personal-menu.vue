<template>
  <template v-if="!session.user.value || detached">
    <v-btn
      v-if="!showHeader || $vuetify.display.smAndDown"
      :title="t('login')"
      stacked
      @click="!detached ? session.login() : null"
    >
      <v-icon size="x-large" :icon="mdiAccountCircle" />
    </v-btn>
    <v-btn
      v-else
      :class="`bg-${loginColor}`"
      stacked
      @click="!detached ? session.login() : null"
    >
      {{ t('login') }}
    </v-btn>
  </template>

  <ClientOnly v-else>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :title="t('openPersonalMenu')"
          :append-icon="personal ? mdiMenuDown : undefined"
          :class="`bg-${loginColor}`"
        >
          <v-avatar :image="avatarUrl" />
          <template v-if="(showHeader && !$vuetify.display.smAndDown) || personal">
            <p class="ml-2">{{ session.user.value.name }}</p>
          </template>
        </v-btn>
      </template>

      <v-list>
        <v-list-subheader v-if="(!showHeader || $vuetify.display.smAndDown) && !personal">
          {{ session.user.value.name }}
        </v-list-subheader>
        <!-- TODO: Redirect to the true back-office -->
        <template v-if="isPortalOwner">
          <v-list-item
            :prepend-icon="mdiWrench"
            href="/data-fair"
            title="Back-office"
          />
          <v-divider />
        </template>
        <v-list-item
          v-if="!personal"
          to="/me/account"
          :prepend-icon="mdiAccountKey"
          :title="t('personalSpace')"
        />
        <v-list-item
          :prepend-icon="mdiLogout"
          :title="t('logout')"
          @click="session.logout(); $router.push('/')"
        />
      </v-list>
    </v-menu>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiAccountCircle, mdiAccountKey, mdiLogout, mdiMenuDown, mdiWrench } from '@mdi/js'

const session = useSession()

const { detached } = defineProps({
  loginColor: { type: String, default: undefined },
  personal: { type: Boolean, default: false },
  showHeader: { type: Boolean, default: false },
  detached: { type: Boolean, default: false }
})

const { t } = useI18n()

let portalOwner: Account | undefined

if (!detached && session.user.value) {
  const { $portal } = useNuxtApp()
  portalOwner = $portal.owner
}

const avatarUrl = computed(() => {
  if (!session.user.value) return
  return `/simple-directory/api/avatars/user/${session.user.value.id}/avatar.png`
})

const isPortalOwner = computed(() => {
  const user = session.user.value
  if (!user || !portalOwner) return false
  return (
    (portalOwner.type === 'user' && portalOwner.id === user.id) ||
    (
      portalOwner.type === 'organization' &&
      user.organizations.find(o => o.id === portalOwner.id && o.role !== 'user')
    )
  )
})

</script>

<i18n lang="yaml">
  en:
    login: 'Log in'
    logout: 'Log out'
    personalSpace: 'Personal Space'
    openPersonalMenu: 'Open personal menu'

  fr:
    login: 'Se connecter'
    logout: 'Se déconnecter'
    personalSpace: 'Espace personnel'
    openPersonalMenu: "Ouvrir l'espace personnel"

</i18n>
