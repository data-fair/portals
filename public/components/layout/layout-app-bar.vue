<template>
  <v-app-bar
    :class="`app-bar-${config.appBarColor || 'primary'} ` + (appBarDark ? 'area--dark' : 'area--light')"
    :color="appBarMainColor"
    height="64"
    style="max-height: 64px;"
  >
    <nav-tabs-or-menu
      v-if="initialized && navigation"
      :background-dark="appBarDark"
      :navigation="navigation"
    />

    <v-spacer />

    <v-toolbar-items>
      <client-only>
        <notifications-queue
          v-if="notifyUrl && config.authentication !== 'none'"
          :notify-url="notifyUrl"
          :login-href="loginHref"
          :background-dark="appBarDark"
        />
      </client-only>
      <template v-if="initialized && config.authentication !== 'none'">
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
                :class="{'white--text': appBarDark}"
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
              <!--<v-list-item dense>
              <v-list-item-title style="overflow: visible;">
                <v-switch
                  v-model="$vuetify.theme.dark"
                  hide-details
                  class="mt-0"
                  label="mode nuit"
                  color="white"
                  @change="setDarkCookie"
                />
              </v-list-item-title>
            </v-list-item>-->
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
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
const { mapState, mapGetters, mapActions } = require('vuex')
const debug = require('debug')('app-bar')
debug.log = console.log.bind(console)

export default {
  async fetch () {
    await this.$store.dispatch('fetchPages')
  },
  computed: {
    ...mapState(['config', 'portal', 'pages']),
    ...mapState('session', ['user', 'initialized']),
    ...mapGetters(['themeColorDark', 'secondaryColorDark', 'embed', 'directoryUrl', 'dataFairUrl', 'notifyUrl', 'navigation']),
    ...mapGetters('session', ['loginUrl']),
    extraMenus () {
      return (this.pages || [])
        .filter(p => p.navigation && p.navigation.type === 'menu')
        .map(p => p.navigation.title)
        .filter((m, i, s) => s.indexOf(m) === i)
    },
    url () {
      return global.location && global.location.href
    },
    mainDataFairUrl () {
      return process.env.mainDataFairUrl
    },
    backOfficeUrl () {
      let url = this.mainDataFairUrl + '/'
      url += '?account=' + encodeURIComponent(this.config.owner.type + ':' + this.config.owner.id)
      return url
    },
    loginHref () {
      return this.loginUrl(
        this.url,
        false,
        { org: this.config.owner.type === 'organization' ? this.config.owner.id : '', primary: this.config.themeColor }
      )
    },
    appBarMainColor () {
      const appBarColor = this.config.appBarColor || 'primary'
      if (appBarColor.startsWith('secondary')) return 'secondary'
      if (appBarColor.startsWith('primary')) return 'primary'
      if (appBarColor === 'grey') return '#424242'
      return appBarColor
    },
    appBarDark () {
      if (this.appBarMainColor === 'secondary') return this.secondaryColorDark
      if (this.appBarMainColor === 'primary') return this.themeColorDark
      if (this.config.appBarColor === 'grey') return true
      if (this.config.appBarColor === 'white') return false
      return true
    }
  },
  methods: {
    ...mapActions('session', ['logout', 'login']),
    reload () {
      window.location.reload()
    },
    setDarkCookie (value) {
      const maxAge = 60 * 60 * 24 * 100 // 100 days
      this.$cookies.set('theme_dark', '' + value, { maxAge })
      this.reload()
    }
  }
}
</script>

<style lang="css" scoped>
</style>
