<template>
  <v-navigation-drawer
    v-model="personalDrawer"
    :color="portalConfig.personal.navigationColor"
    :temporary="$vuetify.display.smAndDown"
    :permanent="!$vuetify.display.smAndDown"
  >
    <!-- VList makes the list itself the only tab stop and gives items tabindex="-2",
         reserving arrow keys for the menu pattern. A personal navigation is a
         navigation, not a menu: the links carry the tab order (tabindex="0") and
         the wrapper (tag="ul") is skipped. Same treatment as nav-drawer.vue. -->
    <v-list
      id="sidebar-navigation"
      :bg-color="portalConfig.personal.navigationColor"
      class="pa-1"
      :role="undefined"
      tag="ul"
      tabindex="-1"
      style="list-style: none"
      nav
    >
      <li>
        <v-list-item
          :prepend-avatar="ownerAvatar"
          :subtitle="t('backToPortal')"
          to="/"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ portalConfig.title }}
          </v-list-item-title>
        </v-list-item>
      </li>
      <li>
        <v-divider :style="navigationTextStyle" />
      </li>
      <li>
        <v-list-subheader
          :title="t('personalSpace')"
          :style="navigationTextStyle"
        />
      </li>

      <li>
        <v-list-item
          :prepend-icon="mdiAccount"
          to="/me/account"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ t('myAccount') }}
          </v-list-item-title>
        </v-list-item>
      </li>
      <li v-if="!portalConfig.personal.hidePages.includes('notifications')">
        <v-list-item
          :prepend-icon="mdiBell"
          to="/me/notifications"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ t('myNotifications') }}
          </v-list-item-title>
        </v-list-item>
      </li>

      <!-- Account switching -->
      <li v-if="accounts.length > 1">
        <v-select
          :model-value="accountValue"
          :label="t('activeAccount')"
          :items="accounts"
          class="my-2"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="(val) => {
            const [org, dep] = (val || '').split(':')
            session.switchOrganization(org || null, dep)
          }"
        />
      </li>

      <li v-if="session.account.value.type === 'organization' && !session.account.value.department && session.accountRole.value === 'admin'">
        <v-list-item
          :prepend-icon="mdiAccountGroup"
          to="/me/organization"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ t('organizationManagement') }}
          </v-list-item-title>
        </v-list-item>
      </li>

      <li v-if="portalConfig.reuses?.allowUserReuses && !isPortalOwner">
        <v-list-item
          :prepend-icon="mdiPageNext"
          to="/me/reuses"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ t('myReuses') }}
          </v-list-item-title>
        </v-list-item>
      </li>

      <li v-if="!session.account.value.department && session.accountRole.value === 'admin' && !portalConfig.personal.hidePages.includes('api-keys')">
        <v-list-item
          :prepend-icon="mdiCloudKey"
          to="/me/api-keys"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ t('apiKeys') }}
          </v-list-item-title>
        </v-list-item>
      </li>

      <li v-if="(datasetsCount.rest || datasetsCount.file) && !portalConfig.personal.hidePages.includes('contribute')">
        <v-list-item
          :prepend-icon="mdiUpload"
          to="/me/update-dataset"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ t('contribute') }}
          </v-list-item-title>
        </v-list-item>
      </li>

      <li v-if="processingsCount && !portalConfig.personal.hidePages.includes('processings')">
        <v-list-item
          :prepend-icon="mdiCogTransferOutline"
          to="/me/processings"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ t('processings') }}
          </v-list-item-title>
        </v-list-item>
      </li>

      <li v-if="isPortalOwner">
        <v-list-item
          :prepend-icon="mdiWrench"
          :href="backOfficeUrl"
          :role="undefined"
          tabindex="0"
        >
          <v-list-item-title class="text-wrap">
            {{ t('backOffice') }}
          </v-list-item-title>
        </v-list-item>
      </li>

      <li
        v-for="(page, p) in portalConfig.personal.accountPages"
        :key="p"
      >
        <v-list-item
          :to="'/me/' + page.id"
          :role="undefined"
          tabindex="0"
        >
          <template #prepend>
            <v-icon
              v-if="page.icon && (page.icon.mdi?.svgPath || page.icon.custom)"
              :icon="page.icon.mdi?.svgPath || page.icon.custom"
              :color="page.icon.color"
            />
          </template>
          <v-list-item-title class="text-wrap">
            {{ page.title }}
          </v-list-item-title>
        </v-list-item>
      </li>
    </v-list>

    <!-- Copyright -->
    <template
      v-if="!portal.whiteLabel"
      #append
    >
      <v-list-item
        ref="copyrightItem"
        href="https://koumoul.com"
        target="_blank"
        rel="noopener"
        :role="undefined"
        tabindex="0"
      >
        <template #title>
          <span class="text-body-small">{{ t('publishYourData') }}</span>
        </template>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { mdiAccount, mdiBell, mdiAccountGroup, mdiCloudKey, mdiUpload, mdiCogTransferOutline, mdiPageNext, mdiWrench } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const { portal, portalConfig, siteInfo } = usePortalStore()
const { personalDrawer } = useNavigationStore()

const datasetsCount = ref({ file: null as number | null, rest: null as number | null })
const processingsCount = ref<number | null>(null)

const accountValue = computed(() => {
  if (session.state.account.type === 'user') return null
  if (session.state.account.department) return session.state.account.id + ':' + session.state.account.department
  else return session.state.account.id
})

// Check if active account is portal owner
const isPortalOwner = computed(() =>
  session.state.account.type === portal.value.owner.type &&
  session.state.account.id === portal.value.owner.id
)

const accounts = computed(() => {
  const accounts = []
  const user = session.state.user

  // IPA for ignore personal account
  if (!user.ipa) {
    accounts.push({
      title: t('personalAccount'),
      value: null,
      prependAvatar: `/simple-directory/api/avatars/user/${user.id}/avatar.png`
    })
  }

  for (const org of user.organizations) {
    const account = {
      title: org.name,
      value: org.id,
      prependAvatar: `/simple-directory/api/avatars/organization/${org.id}/avatar.png`
    }
    if (org.department) {
      account.title += ' / ' + (org.departmentName || org.department)
      account.value += ':' + org.department
      account.prependAvatar = `/simple-directory/api/avatars/organization/${org.id}/${org.department}/avatar.png`
    }
    accounts.push(account)
  }

  return accounts
})

const ownerAvatar = computed(() => {
  if (portal.value.owner.department) return `/simple-directory/api/avatars/${portal.value.owner.type}/${portal.value.owner.id}/${portal.value.owner.department}/avatar.png`
  else return `/simple-directory/api/avatars/${portal.value.owner.type}/${portal.value.owner.id}/avatar.png`
})

const navigationTextStyle = computed(() => {
  return `color: rgba(var(--v-theme-on-${portalConfig.value.personal.navigationColor}), var(--v-medium-emphasis-opacity));`
})

// v-bind:title.attr causes SSR hydration mismatch with Vuetify 4
const copyrightItem = useTemplateRef('copyrightItem')
watchEffect(() => {
  const el = copyrightItem.value?.$el
  if (!el) return
  el.setAttribute('title', t('publishYourData') + ' - ' + t('newWindow'))
})

const requestUrl = useRequestURL()
const backOfficeUrl = computed(() => {
  if (siteInfo.authMode === 'onlyBackOffice' || siteInfo.authMode === 'onlyOtherSite') {
    return `${requestUrl.protocol}//${siteInfo.authOnlyOtherSite}/data-fair/`
  }
  return '/data-fair/'
})

onMounted(async () => {
  let ownerFilter = `${portal.value.owner.type}:${portal.value.owner.id}`
  if (portal.value.owner.department) ownerFilter += `:${portal.value.owner.department}`
  const baseParams = { size: 0, owner: ownerFilter }

  try {
    datasetsCount.value.file = (await $fetch<{ count: number }>('/data-fair/api/v1/catalog/datasets', { params: { ...baseParams, file: true, can: 'writeData' } })).count
    datasetsCount.value.rest = (await $fetch<{ count: number }>('/data-fair/api/v1/catalog/datasets', { params: { ...baseParams, rest: true, can: 'createLine,updateLine' } })).count
    processingsCount.value = (await $fetch<{ count: number }>('/processings/api/v1/processings', { params: baseParams })).count
  } catch (e) {
    console.error('Failed to fetch datasets or processings counts:', e)
  }
})

</script>

<i18n lang="yaml">
  en:
    activeAccount: Active Account
    apiKeys: API Keys
    backToPortal: Back to portal
    backOffice: Go to Back Office
    contribute: Contribute
    myAccount: My Account
    myNotifications: My Notifications
    myReuses: My Reuses
    newWindow: New window
    organizationManagement: Organization Management
    personalAccount: Personal Account
    personalSpace: Personal Space
    processings: Processings
    publishYourData: Publish your own data

  fr:
    activeAccount: Compte actif
    apiKeys: Clés d'API
    backToPortal: Retour au portail
    backOffice: Aller au Back-Office
    contribute: Contribuer
    myAccount: Mon compte
    myNotifications: Mes notifications
    myReuses: Mes réutilisations
    newWindow: Nouvelle fenêtre
    organizationManagement: Gestion de l'organisation
    personalAccount: Compte personnel
    personalSpace: Espace personnel
    processings: Traitements
    publishYourData: Publiez vos propres données
</i18n>
