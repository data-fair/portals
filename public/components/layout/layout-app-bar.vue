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
      <layout-personal-menu
        v-if="initialized && config.authentication !== 'none'"
        :login-href="loginHref"
        :background-dark="appBarDark"
      />
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
import layoutPersonalMenu from './layout-personal-menu.vue'
const { mapState, mapGetters } = require('vuex')
const debug = require('debug')('app-bar')
debug.log = console.log.bind(console)

export default {
  components: { layoutPersonalMenu },
  async fetch () {
    await this.$store.dispatch('fetchPages')
  },
  computed: {
    ...mapState(['config', 'portal']),
    ...mapState('session', ['initialized']),
    ...mapGetters(['themeColorDark', 'secondaryColorDark', 'directoryUrl', 'dataFairUrl', 'notifyUrl', 'navigation']),
    ...mapGetters('session', ['loginUrl']),
    url () {
      return global.location && global.location.href
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
