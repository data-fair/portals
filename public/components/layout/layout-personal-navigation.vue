<template>
  <v-navigation-drawer
    v-model="navContext.drawer"
    class="navigation-left"
    color="primary"
    :dark="personalNavigationColorDark"
    app
    flat
  >
    <v-list
      nav
      class="pa-1"
    >
      <v-list-item
        :nuxt="true"
        :to="`/`"
      >
        <v-list-item-avatar>
          <img :src="`${directoryUrl}/api/avatars/${config.owner.type}/${config.owner.id}/avatar.png`">
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ config.title }}</v-list-item-title>
          <v-list-item-subtitle>Revenir au portail</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-subheader>Espace personnel</v-subheader>
      <v-list-item
        :nuxt="true"
        :to="`/me/account`"
      >
        <v-list-item-action><v-icon>mdi-account-circle</v-icon></v-list-item-action>
        <v-list-item-title>Mon compte</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="config.usesPage && config.usesPage.type !== 'none'"
        :nuxt="true"
        :to="`/me/uses`"
      >
        <v-list-item-action><v-icon>mdi-share-circle</v-icon></v-list-item-action>
        <v-list-item-title>Mes réutilisations</v-list-item-title>
      </v-list-item>
      <v-list-item
        :nuxt="true"
        :to="`/me/notifications`"
      >
        <v-list-item-action><v-icon>mdi-bell-circle</v-icon></v-list-item-action>
        <v-list-item-title>Mes notifications</v-list-item-title>
      </v-list-item>
      <v-list-item
        :nuxt="true"
        :to="`/me/api-keys`"
      >
        <v-list-item-action><v-icon>mdi-cloud-circle</v-icon></v-list-item-action>
        <v-list-item-title>Mes clés d'API</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['navContext'],
  computed: {
    ...mapState(['config']),
    ...mapGetters(['logoUrl', 'directoryUrl', 'personalNavigationColorDark'])
  }
}
</script>

<style>
.navigation-left .v-list-item__action {
  margin-right: 16px !important;
}
</style>
