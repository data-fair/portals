<template>
  <client-only>
    <v-btn
      v-if="!user"
      depressed
      color="transparent"
      :href="loginHref"
    >
      Se connecter
    </v-btn>
    <v-menu
      v-else
      offset-y
      nudge-left
    >
      <template #activator="{on}">
        <v-btn
          text
          :class="{'white--text': backgroundDark}"
          :height="64"
          v-on="on"
        >
          <v-avatar :size="36">
            <img :src="`${directoryUrl}/api/avatars/user/${user.id}/avatar.png`">
          </v-avatar>
                  &nbsp;
          {{ user.name }}
          <v-icon right>
            mdi-menu-down
          </v-icon>
        </v-btn>
      </template>
      <v-list
        outlined
        class="py-0"
      >
        <template v-if="(config.owner.type === 'user' && config.owner.id === user.id) || (config.owner.type === 'organization' && user.organizations.find(o => o.id === config.owner.id))">
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
    ...mapState(['config']),
    ...mapState('session', ['user']),
    ...mapGetters(['directoryUrl', 'embed']),
    backOfficeUrl () {
      let url = process.env.mainDataFairUrl + '/'
      url += '?account=' + encodeURIComponent(this.config.owner.type + ':' + this.config.owner.id)
      return url
    }
  },
  methods: {
    ...mapActions('session', ['logout', 'login'])
  }
}
</script>

<style>

</style>
