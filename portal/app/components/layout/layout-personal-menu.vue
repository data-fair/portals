<template>
  <template v-if="!session.user.value || preview">
    <v-btn
      v-if="!showHeader || $vuetify.display.smAndDown"
      :title="t('login')"
      :class="backgroundColor"
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
      :class="backgroundColor"
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
          :class="backgroundColor"
        >
          <v-avatar
            :image="avatarUrl"
            class="bg-transparent"
            :size="40"
            alt=""
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

const { loginColor, navBarColor } = defineProps<{
  loginColor?: string
  navBarColor?: string
  personal?: boolean
  showHeader?: boolean // TODO: it's never passed !
}>()

const { t } = useI18n()
const { portal, preview, siteInfo } = usePortalStore()
const session = useSession()

let avatarUrl: ComputedRef<string | undefined>
let isPortalOwner: ComputedRef<boolean>
let backOfficeUrl: ComputedRef<string>
if (!preview) {
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
        !!user.organizations.find(o => o.id === portal.value.owner.id && o.role !== 'user')
      )
    )
  })

  const requestUrl = useRequestURL()

  backOfficeUrl = computed(() => {
    if (siteInfo.authMode === 'onlyBackOffice' || siteInfo.authMode === 'onlyOtherSite') {
      return `${requestUrl.protocol}//${siteInfo.authOnlyOtherSite}/data-fair/`
    }
    return '/data-fair/'
  })
}

const backgroundColor = computed(() => {
  if (loginColor && loginColor !== 'background') return loginColor
  if (loginColor === 'background' && navBarColor !== 'background') return 'background'
  if (!loginColor && navBarColor && navBarColor !== 'background') return navBarColor
  return undefined
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
