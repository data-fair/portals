<template>
  <v-app-bar
    :class="themeColorDark ? 'area--dark' : 'area--light'"
    color="primary"
    height="64"
    style="max-height: 64px;"
  >
    <v-row align="center">
      <v-col :cols="6" :md="10">
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
            <v-tab
              v-if="!config.datasetsPage || config.datasetsPage.type !== 'none'"
              :to="{name: 'datasets'}"
              class="font-weight-bold"
            >
              Les données
            </v-tab>
            <v-tab
              v-if="!config.reusesPage || config.reusesPage.type !== 'none'"
              :to="{name: 'reuses'}"
              class="font-weight-bold"
            >
              Visualisations
            </v-tab>
            <template v-if="pages">
              <v-tab
                v-for="page in pages.filter(p => p.navigation && p.navigation.type === 'direct')"
                :key="page._id"
                :to="{name: 'pages-id', params: {id: page._id}}"
                class="font-weight-bold"
              >
                {{ page.title }}
              </v-tab>
              <v-menu
                v-for="menu in extraMenus"
                :key="menu"
                offset-y
                nudge-left
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    text
                    v-bind="attrs"
                    :height="64"
                    v-on="on"
                  >
                    {{ menu }}
                    <v-icon right>
                      mdi-menu-down
                    </v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="page in pages.filter(p => p.navigation && p.navigation.type === 'menu' && p.navigation.title === menu)"
                    :key="page._id"
                    :to="{name: 'pages-id', params: {id: page._id}}"
                  >
                    <v-list-item-title>{{ page.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
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
      <v-col :cols="6" :md="2">
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
              <v-btn
                text
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
            <v-list>
              <v-list-item :href="dataFairUrl">
                <v-list-item-title>Back-office</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="user.isAdmin" :to="{name: 'pages'}">
                <v-list-item-title>Gestion des pages</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="user.isAdmin" :to="{name: 'config'}">
                <v-list-item-title>Configuration du portail</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item :href="directoryUrl + '/me'">
                <v-list-item-title>Mon compte</v-list-item-title>
              </v-list-item>
              <v-list-item @click="logout">
                <v-list-item-title>Se déconnecter</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script>
  import XsMenu from '~/components/layout/xs-menu'
  const { mapState, mapGetters, mapActions } = require('vuex')

  export default {
    components: { XsMenu },
    async fetch() {
      this.pages = (await this.$axios.$get(process.env.publicUrl + '/api/v1/pages', { params: { size: 1000, select: '_id,title,navigation' } })).results
    },
    data: () => ({
      pages: null,
    }),
    computed: {
      ...mapState(['config', 'textDark']),
      ...mapState('session', ['user', 'initialized']),
      ...mapGetters(['themeColorDark']),
      directoryUrl() {
        return process.env.directoryUrl
      },
      dataFairUrl() {
        return process.env.dataFairUrl + (process.env.development ? '/' : '')
      },
      extraMenus() {
        return (this.pages || []).filter(p => p.navigation && p.navigation.type === 'menu').map(p => p.navigation.title).filter((m, i, s) => s.indexOf(m) === i)
      },
    },
    methods: {
      ...mapActions('session', ['logout', 'login']),
    },
  }
</script>

<style lang="css" scoped>
</style>
