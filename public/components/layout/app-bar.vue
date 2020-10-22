<template>
  <v-app-bar
    :class="themeColorDark ? 'area--dark' : 'area--light'"
    color="primary"
    height="64"
    style="max-height: 64px;"
  >
    <v-row align="center">
      <v-col :cols="user ? 2 : 6" :lg="user ? 8 : 10" :md="user ? 7 : 10">
        <xs-menu />
        <v-container v-show="$vuetify.breakpoint.mdAndUp" class="py-0">
          <v-tabs
            background-color="primary"
            height="64"
            :dark="themeColorDark"
            centered
          >
            <v-tabs-slider :color="themeColorDark ? 'white' : textDark" />
            <v-tab
              :to="{name: 'index'}"
              class="font-weight-bold"
            >
              Accueil
            </v-tab>
            <v-tab :to="{name: 'datasets'}" class="font-weight-bold">
              Les données
            </v-tab>
            <v-tab :to="{name: 'reuses'}" class="font-weight-bold">
              Visualisations
            </v-tab>
            <v-tab
              v-if="config.contact"
              :href="config.contact"
              class="font-weight-bold"
            >
              Nous contacter
            </v-tab>
            <!-- <v-tab v-if="user && user.isAdmin" :to="{name: 'config'}" class="font-weight-bold">
              Configuration
            </v-tab> -->
          </v-tabs>
        </v-container>
      </v-col>
      <v-col :cols="user ? 10 : 6" :lg="user ? 4 :2" :md="user ? 5 : 2">
        <v-row class="pa-0">
          <v-spacer />
          <v-btn
            v-if="user"
            depressed
            color="primary"
            :href="dataFairUrl"
          >
            Back-office
          </v-btn>
          <template v-if="initialized">
            <v-btn
              v-if="!user"
              depressed
              color="primary"
              @click="login"
            >
              Se connecter
            </v-btn>
            <v-menu
              v-else
              offset-y
              nudge-left
            >
              <template v-slot:activator="{on}">
                <v-btn text v-on="on">
                  <v-avatar :size="36">
                    <img :src="`${directoryUrl}/api/avatars/user/${user.id}/avatar.png`">
                  </v-avatar>
                  &nbsp;
                  {{ user.name }}
                </v-btn>
              </template>
              <v-list>
                <v-list-item :href="directoryUrl + '/me'">
                  <v-list-item-title>Mon compte</v-list-item-title>
                </v-list-item>

                <v-divider />

                <v-list-item @click="logout">
                  <v-list-item-title>Se déconnecter</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-row>
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script>
import XsMenu from '~/components/layout/xs-menu'
const { mapState, mapGetters, mapActions } = require('vuex')

export default {
  components: { XsMenu },
  computed: {
    ...mapState(['config', 'textDark']),
    ...mapState('session', ['user', 'initialized']),
    ...mapGetters(['themeColorDark']),
    directoryUrl() {
      return process.env.directoryUrl
    },
    dataFairUrl() {
      return process.env.dataFairUrl + (process.env.development ? '/' : '')
    }
  },
  methods: {
    ...mapActions('session', ['logout', 'login'])
  }
}
</script>

<style lang="css" scoped>
</style>
