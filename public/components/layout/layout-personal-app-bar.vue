<template>
  <v-app-bar
    color="white"
    dense
    flat
    app
  >
    <v-toolbar-items v-if="!navContext.drawer">
      <v-btn
        icon
        color="primary"
        title="ouvrir le menu de navigation"
        @click="navContext.drawer = true"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-toolbar-items>
    <v-breadcrumbs
      v-if="childBreadcrumbItems && childBreadcrumbsRouteName === $route.name && $vuetify.breakpoint.mdAndUp"
      :items="childBreadcrumbItems"
      :large="!$vuetify.breakpoint.mobile"
      :class="{'pl-1': $vuetify.breakpoint.mobile}"
    />
    <v-spacer />
    <v-toolbar-items>
      <client-only>
        <notifications-queue
          v-if="isPublished && notifyUrl && config.authentication !== 'none'"
          :notify-url="notifyUrl"
          :login-href="loginHref"
        />
      </client-only>
      <template v-if="initialized && config.authentication !== 'none'">
        <client-only>
          <v-menu
            offset-y
            nudge-left
          >
            <template #activator="{on}">
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
            <v-list
              outlined
              class="py-0"
            >
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
                :disabled="embed"
                @click="logout(false);$router.push('/')"
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
  props: ['navContext'],
  computed: {
    ...mapState(['config', 'textDark', 'portal', 'childBreadcrumbItems', 'childBreadcrumbsRouteName']),
    ...mapState('session', ['user', 'initialized']),
    ...mapGetters(['primaryColorDark', 'secondaryColorDark', 'embed', 'directoryUrl', 'dataFairUrl', 'notifyUrl', 'isPublished']),
    ...mapGetters('session', ['loginUrl']),
    url () {
      return global.location && global.location.href
    },
    backOfficeUrl () {
      let url = process.env.mainDataFairUrl + '/'
      url += '?account=' + encodeURIComponent(this.config.owner.type + ':' + this.config.owner.id)
      return url
    },
    loginHref () {
      return this.loginUrl(
        this.url,
        false
      )
    }
  },
  watch: {
    activeTab () {
      debug('watcher activeTab', this.activeTab)
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
