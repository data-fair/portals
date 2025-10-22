<template>
  <template v-if="!session.user.value || preview">
    <v-btn
      v-if="!showHeader || $vuetify.display.smAndDown"
      :title="t('login')"
      :class="`bg-${loginColor}`"
      stacked
      @click="!preview ? session.login() : null"
    >
      <v-icon
        size="x-large"
        :icon="mdiAccountCircle"
      />
    </v-btn>
    <v-btn
      v-else
      :class="`bg-${loginColor}`"
      stacked
      @click="!preview ? session.login() : null"
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
          :class="loginColor !== 'primary' ? 'bg-' + loginColor : undefined"
        >
          <v-avatar
            :image="avatarUrl"
            :size="40"
          />
          <template v-if="(showHeader && !$vuetify.display.smAndDown) || personal">
            <p class="ml-2">{{ session.user.value.name }}</p>
          </template>
        </v-btn>
      </template>

      <v-list>
        <v-list-subheader v-if="(!showHeader || $vuetify.display.smAndDown) && !personal">
          {{ session.user.value.name }}
        </v-list-subheader>
        <template v-if="isPortalOwner">
          <v-list-item
            :prepend-icon="mdiWrench"
            :href="backOfficeUrl"
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
import { mdiAccountCircle, mdiAccountKey, mdiLogout, mdiMenuDown, mdiWrench } from '@mdi/js'

defineProps<{
  loginColor?: string
  personal?: boolean
  showHeader?: boolean // TODO: it's never passed !
}>()

const { t } = useI18n()
const { portal, preview } = usePortalStore()
const session = useSession()

let avatarUrl, isPortalOwner, backOfficeUrl
if (!preview) {
  const config = useRuntimeConfig()

  avatarUrl = computed(() => {
    if (!session.user.value) return
    return `/simple-directory/api/avatars/user/${session.user.value.id}/avatar.png`
  })

  isPortalOwner = computed(() => {
    const user = session.user.value
    if (!user || !portal.value.owner) return false
    return (
      (portal.value.owner.type === 'user' && portal.value.owner.id === user.id) ||
      (
        portal.value.owner.type === 'organization' &&
        user.organizations.find(o => o.id === portal.value.owner.id && o.role !== 'user')
      )
    )
  })

  const requestUrl = useRequestURL()

  backOfficeUrl = computed(() => {
    const site = session.site.value
    if (!site) return '/data-fair/'
    if (site.authMode === 'onlyBackOffice') return config.mainPublicUrl
    if (!site.isAccountMain && site.authMode === 'onlyOtherSite') {
      return `${requestUrl.protocol}//${site.authOnlyOtherSite}/data-fair/`
    }
    return '/data-fair/'
  })
}

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
