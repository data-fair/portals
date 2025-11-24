<template>
  <v-navigation-drawer
    v-model="drawer"
    :color="portalConfig.personal.navigationColor"
    :temporary="$vuetify.display.smAndDown"
    :permanent="!$vuetify.display.smAndDown"
  >
    <v-list
      :bg-color="portalConfig.personal.navigationColor"
      class="pa-1"
      nav
    >
      <v-list-item
        :title="portalConfig.title"
        :prepend-avatar="ownerAvatar"
        :subtitle="t('backToPortal')"
        to="/"
      />
      <v-divider :style="navigationTextStyle" />
      <v-list-subheader
        :title="t('personalSpace')"
        :style="navigationTextStyle"
      />

      <v-list-item
        :prepend-icon="mdiAccount"
        :title="t('myAccount')"
        to="/me/account"
      />
      <!-- TODO: Add reuses -->
      <!-- <v-list-item
        to="/me/uses"
        :prepend-icon="mdiShare"
        title="Mes réutilisations"
      /> -->
      <v-list-item
        v-if="!portalConfig.personal.hidePages.includes('notifications')"
        :prepend-icon="mdiBell"
        :title="t('myNotifications')"
        to="/me/notifications"
      />

      <!-- Account switching -->
      <v-select
        v-if="accounts.length > 1"
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

      <v-list-item
        v-if="session.account.value.type === 'organization' && !session.account.value.department && session.accountRole.value === 'admin'"
        :prepend-icon="mdiAccountGroup"
        :title="t('organizationManagement')"
        to="/me/organization"
      />

      <v-list-item
        v-if="!session.account.value.department && session.accountRole.value === 'admin' && !portalConfig.personal.hidePages.includes('api-keys')"
        :prepend-icon="mdiCloudKey"
        :title="t('apiKeys')"
        to="/me/api-keys"
      />

      <v-list-item
        v-if="!portalConfig.personal.hidePages.includes('contribute')"
        :prepend-icon="mdiUpload"
        :title="t('contribute')"
        to="/me/update-dataset"
      />

      <v-list-item
        v-if="!portalConfig.personal.hidePages.includes('processings')"
        :prepend-icon="mdiCogTransferOutline"
        :title="t('processings')"
        to="/me/processings"
      />

      <v-list-item
        v-for="(page, p) in portalConfig.personal.accountPages"
        :key="p"
        :to="'/me/' + page.id"
        :title="page.title"
      >
        <template #prepend>
          <v-icon
            v-if="page.icon && (page.icon.mdi?.svgPath || page.icon.custom)"
            :icon="page.icon.mdi?.svgPath || page.icon.custom"
            :color="page.icon.color"
          />
        </template>
      </v-list-item>
    </v-list>

    <!-- Copyright -->
    <template #append>
      <v-list-item
        href="https://koumoul.com"
        target="_blank"
        rel="noopener"
      >
        <span class="text-caption">{{ t('publishYourData') }}</span>
      </v-list-item>
    </template>

  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { mdiAccount, mdiBell, mdiAccountGroup, mdiCloudKey, mdiUpload, mdiCogTransferOutline } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const { portal, portalConfig } = usePortalStore()
const { drawer } = useNavigationStore()

const accountValue = computed(() => {
  if (session.state.account.type === 'user') return null
  if (session.state.account.department) return session.state.account.id + ':' + session.state.account.department
  else return session.state.account.id
})

const accounts = computed(() => {
  const accounts = []
  if (!session.state.user.ipa || !session.state.user.organizations.length) {
    accounts.push({
      title: t('personalAccount'),
      value: null,
      prependAvatar: `/simple-directory/api/avatars/user/${session.state.user.id}/avatar.png`
    })
  }

  for (const org of session.state.user.organizations) {
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

</script>

<i18n lang="yaml">
  en:
    activeAccount: Active Account
    apiKeys: API Keys
    backToPortal: Back to portal
    contribute: Contribute
    myAccount: My Account
    myNotifications: My Notifications
    organizationManagement: Organization Management
    personalAccount: Personal Account
    personalSpace: Personal Space
    processings: Processings
    publishYourData: Publish your own data

  fr:
    activeAccount: Compte actif
    apiKeys: Clés d'API
    backToPortal: Retour au portail
    contribute: Contribuer
    myAccount: Mon compte
    myNotifications: Mes notifications
    organizationManagement: Gestion de l'organisation
    personalAccount: Compte personnel
    personalSpace: Espace personnel
    processings: Traitements
    publishYourData: Publiez vos propres données
</i18n>
