<template>
  <v-app-bar v-bind="appBarProps">
    <!-- 128 px -->
    <layout-header v-if="!config.headerHide" />

    <!-- 64 px -->
    <template #extension>
      <layout-header-logo
        v-if="config.headerHide"
        :height="56"
      />
      <nav-tabs-or-menu
        v-if="initialized && navigation"
        :background-dark="appBarMainColorDark"
        :navigation="navigation"
      />
      <v-toolbar-items>
        <client-only>
          <notifications-queue
            v-if="notifyUrl && config.authentication !== 'none' && $vuetify.breakpoint.smAndUp"
            :notify-url="notifyUrl"
            :login-href="loginHref"
            :background-dark="appBarMainColorDark"
          />
        </client-only>
        <layout-personal-menu
          v-if="initialized && config.authentication !== 'none'"
          :login-href="loginHref"
          :background-dark="appBarMainColorDark"
        />
      </v-toolbar-items>
    </template>
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
    ...mapGetters(['primaryColorDark', 'secondaryColorDark', 'directoryUrl', 'dataFairUrl', 'notifyUrl', 'navigation', 'appBarMainColorDark', 'appBarElevation']),
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
    appBarProps () {
      const props = {
        class: `main-app-bar mb-3 app-bar-${this.$vuetify.breakpoint.name}`,
        height: this.config.headerHide ? 1 : 128,
        extensionHeight: 64,
        style: 'max-height:192px;',
        app: true
      }
      if (this.appBarMainColorDark) props.class += ' area--dark'
      else props.class += ' area--light'
      if (this.config.appBarFluid !== false) props.class += ' app-bar-fluid'
      if (this.config.appBarBehavior === 'stick' || (this.config.appBarBehavior === 'stickHome' && this.$route.path === '/')) {
        props.hideOnScroll = true
        if (this.appBarElevation === 0) props.elevateOnScroll = true
      } else {
        props.absolute = true
      }
      if (!props.elevateOnScroll) props.elevation = this.appBarElevation
      return props
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

<style lang="css">
.main-app-bar .v-toolbar__content {
  padding: 0 !important;
}
.main-app-bar .v-toolbar__extension {
  padding-left: 12px;
  padding-right: 12px;
}
.main-app-bar.app-bar-xs .v-toolbar__extension {
  padding-left: 6px;
  padding-right: 0px;
}

.main-app-bar .v-toolbar__extension {
  margin-right: auto;
  margin-left: auto;
}
.main-app-bar.app-bar-fluid .v-toolbar__extension {
  max-width: 1928px;
}
@media (min-width: 960px) {
  .main-app-bar:not(.app-bar-fluid) .v-toolbar__extension {
    max-width: 900px;
  }
}
@media (min-width: 1264px) {
  .main-app-bar:not(.app-bar-fluid) .v-toolbar__extension {
    max-width: 1185px;
  }
}
@media (min-width: 1904px) {
  .main-app-bar:not(.app-bar-fluid) .v-toolbar__extension {
    max-width: 1785px;
  }
}
</style>
