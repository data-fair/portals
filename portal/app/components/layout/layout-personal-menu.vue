<template>
  <template v-if="!session.user.value">
    <v-btn
      v-if="!showHeader || $vuetify.display.smAndDown"
      title="Se connecter"
      stacked
      @click="session.login()"
    >
      <v-icon size="x-large" :icon="mdiAccountCircle" />
    </v-btn>
    <v-btn
      v-else
      :class="`bg-${loginColor}`"
      stacked
      @click="session.login()"
    >
      Se connecter
    </v-btn>
  </template>

  <v-menu
    v-else
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        title="Ouvrez le menu personnel"
        :append-icon="personal ? mdiMenuDown : undefined"
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
      <!-- TODO: Check if the user is owner of the portal ? -->
      <!-- TODO: Redirect to the true back-office -->
      <!-- <template v-if="(config.owner.type === 'user' && config.owner.id === user.id) || (config.owner.type === 'organization' && user.organizations.find(o => o.id === config.owner.id && o.role !== 'user'))"> -->
      <template v-if="true">
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
        title="Espace personnel"
      />
      <v-list-item
        :prepend-icon="mdiLogout"
        title="Se déconnecter"
        @click="session.logout(); $router.push('/')"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { mdiAccountCircle, mdiAccountKey, mdiLogout, mdiMenuDown, mdiWrench } from '@mdi/js'

const session = useSession()

defineProps<{
  loginColor?: string
  personal?: boolean
  showHeader?: boolean
}>()

// TODO Always show user avatar ?
// const avatarUrl = computed(() => {
//   if (!session.state.account) return
//   if (session.state.account.department) return `/simple-directory/api/avatars/${session.state.account.type}/${session.state.account.id}/${session.state.account.department}/avatar.png`
//   else return `/simple-directory/api/avatars/${session.state.account.type}/${session.state.account.id}/avatar.png`
// })
const avatarUrl = computed(() => {
  if (!session.user.value) return
  return `/simple-directory/api/avatars/user/${session.user.value.id}/avatar.png`
})

</script>
