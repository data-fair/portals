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
        v-if="config.usesManagement && config.usesManagement.type === 'users'"
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
      <v-list-item
        v-if="datasetsCount.rest || datasetsCount.file"
        :nuxt="true"
        :to="`/me/update-dataset`"
      >
        <v-list-item-action><v-icon>mdi-upload</v-icon></v-list-item-action>
        <v-list-item-title>Contribuer</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['navContext'],
  data () {
    return {
      datasetsCount: { file: null, rest: null }
    }
  },
  computed: {
    ...mapState(['config', 'portal']),
    ...mapGetters(['logoUrl', 'directoryUrl', 'personalNavigationColorDark', 'dataFairUrl'])
  },
  async mounted () {
    const owner = this.config.owner
    let ownerFilter = `${owner.type}:${owner.id}`
    if (owner.department) ownerFilter += `:${owner.department}`
    const baseParams = { size: 0, owner: ownerFilter, publicationSites: `data-fair-portals:${this.portal._id}` }
    this.datasetsCount.file = (await this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', { params: { ...baseParams, file: true, can: 'writeData' } })).count
    this.datasetsCount.rest = (await this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', { params: { ...baseParams, rest: true, can: 'createLine,updateLine' } })).count
  }
}
</script>

<style>
.navigation-left .v-list-item__action {
  margin-right: 16px !important;
}
</style>
