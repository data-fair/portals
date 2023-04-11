<template>
  <client-only>
    <v-btn
      v-if="!user"
      depressed
      color="transparent"
      :href="loginHref"
    >
      <v-icon
        v-if="dense"
        large
        :color="backgroundDark ? 'white' : 'primary'"
        title="se connecter"
      >
        mdi-account-circle
      </v-icon>
      <template v-else>
        Se connecter
      </template>
    </v-btn>
    <v-menu
      v-else
      offset-y
      nudge-left
    >
      <template #activator="{ on, attrs }">
        <v-btn
          text
          v-bind="attrs"
          :class="{'white--text': backgroundDark}"
          :height="64"
          title="Ouvrez le menu personnel"
          v-on="on"
        >
          <v-avatar :size="36">
            <img
              :src="`${directoryUrl}/api/avatars/user/${user.id}/avatar.png`"
              aria-hidden
              :alt="'Avatar de ' + user.name"
            >
          </v-avatar>
                  &nbsp;
          <template v-if="!dense">
            {{ user.name }}
          </template>
        </v-btn>
      </template>
      <v-list
        outlined
        class="py-0"
      >
        <v-subheader v-if="dense">
          {{ user.name }}
        </v-subheader>
        <template v-if="(config.owner.type === 'user' && config.owner.id === user.id) || (config.owner.type === 'organization' && user.organizations.find(o => o.id === config.owner.id && o.role !== 'user'))">
          <v-list-item
            :href="backOfficeUrl"
            :disabled="embed"
          >
            <v-list-item-action><v-icon>mdi-wrench</v-icon></v-list-item-action>
            <v-list-item-title>Back-office</v-list-item-title>
          </v-list-item>
          <v-divider />
        </template>
        <v-list-item
          :to="{name: 'me-account'}"
          nuxt
        >
          <v-list-item-action><v-icon>mdi-account-key</v-icon></v-list-item-action>
          <v-list-item-title>Espace personnel</v-list-item-title>
        </v-list-item>
        <template v-if="userPartners && userPartners.length">
          <v-list-item
            v-for="partner of userPartners.filter(up => up.role === 'admin' || up.role === 'contrib')"
            :key="partner.id"
            :to="`/partner/${partner.id}/update-dataset`"
            nuxt
          >
            <v-list-item-action>
              <v-avatar :size="24">
                <img
                  :src="`${directoryUrl}/api/avatars/organization/${partner.id}/avatar.png`"
                  aria-hidden
                  :alt="'Avatar de ' + user.name"
                >
              </v-avatar>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Espace partenaire</v-list-item-title>
              <v-list-item-subtitle>{{ partner.name }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-list-item
          :disabled="embed"
          @click="logout"
        >
          <v-list-item-action><v-icon>mdi-logout</v-icon></v-list-item-action>
          <v-list-item-title>Se déconnecter</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </client-only>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  props: ['loginHref', 'backgroundDark'],
  computed: {
    ...mapState(['config', 'textDark', 'userPartners']),
    ...mapState('session', ['user']),
    ...mapGetters(['directoryUrl', 'embed']),
    backOfficeUrl () {
      let url = process.env.mainDataFairUrl + '/'
      url += '?account=' + encodeURIComponent(this.config.owner.type + ':' + this.config.owner.id)
      return url
    },
    dense () {
      return this.config.headerHide || this.$vuetify.breakpoint.smAndDown
    }
  },
  mounted () {
    this.fetchUserPartners()
  },
  methods: {
    ...mapActions(['fetchUserPartners']),
    ...mapActions('session', ['logout', 'login'])
  }
}
</script>

<style>

</style>
