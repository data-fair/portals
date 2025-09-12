<template>
  <v-navigation-drawer
    permanent
  >
    <v-list
      class="pa-1"
      nav
    >
      <!-- TODO: Image of the owner of the portal-->
      <v-list-item
        :title="portalConfig.title"
        prepend-avatar="https://cdn.vuetifyjs.com/images/john.png"
        subtitle="Revenir au portail"
        to="/"
      />
      <v-divider />
      <v-list-subheader title="Espace personnel" />

      <v-list-item
        :prepend-icon="mdiAccount"
        to="/me/account"
        title="Mon compte"
      />
      <!-- TODO: Add reuses -->
      <!-- <v-list-item
        to="/me/uses"
        :prepend-icon="mdiShare"
        title="Mes réutilisations"
      /> -->
      <v-list-item
        :prepend-icon="mdiBell"
        title="Mes notifications"
        to="/me/notifications"
      />

      <!-- Account switching -->
      <v-select
        v-if="accounts.length > 1"
        :model-value="accountValue"
        label="Compte actif"
        class="my-2"
        variant="outlined"
        density="compact"
        hide-details
        :items="accounts"
        @update:model-value="(val) => {
          const [org, dep] = (val || '').split(':')
          session.switchOrganization(org || null, dep)
        }"
      />

      <v-list-item
        v-if="session.account.value.type === 'organization' && !session.account.value.department && session.accountRole.value === 'admin'"
        :prepend-icon="mdiAccountGroup"
        title="Gestion de l'organisation"
        to="/me/organization"
      />

      <v-list-item
        v-if="!session.account.value.department && session.accountRole.value === 'admin'"
        :prepend-icon="mdiKeyChain"
        title="Clés d'API"
        to="/me/api-keys"
      />

      <v-list-item
        :prepend-icon="mdiUpload"
        title="Contribuer"
        to="/me/update-dataset"
      />

      <v-list-item
        :prepend-icon="mdiCogTransferOutline"
        title="Traitements"
        to="/me/processings"
      />
    </v-list>

    <!-- Copyright -->
    <template #append>
      <v-list-item
        href="https://koumoul.com"
        target="_blank"
      >
        <span class="text-caption">Publiez vos propres données</span>
      </v-list-item>
    </template>

  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal'
import { mdiAccount, mdiBell, mdiAccountGroup, mdiKeyChain, mdiUpload, mdiCogTransferOutline } from '@mdi/js'

const session = useSessionAuthenticated()
const accountValue = computed(() => {
  if (session.state.account.type === 'user') return null
  if (session.state.account.department) return session.state.account.id + ':' + session.state.account.department
  else return session.state.account.id
})

defineProps({
  portalConfig: { type: Object as () => PortalConfig, required: true }
})

const accounts = computed(() => {
  const accounts = []
  if (!session.state.user.ipa || !session.state.user.organizations.length) {
    accounts.push({
      title: 'Compte personnel',
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

</script>
