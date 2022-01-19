<template>
  <v-app-bar
    :class="themeColorDark ? 'area--dark' : 'area--light'"
    color="primary"
    height="64"
    style="max-height: 64px;"
  >
    <xs-menu :pages="pages" :extra-menus="extraMenus" />
    <v-tabs
      v-show="$vuetify.breakpoint.mdAndUp"
      v-model="activeTab"
      background-color="primary"
      height="64"
      :dark="themeColorDark"
      centered
      slider-size="4"
    >
      <v-tabs-slider :color="themeColorDark ? 'white' : textDark" />
      <v-tab
        :value="hidden"
        style="width:0px;min-width:0px;max-width:0px;padding:0px;"
      />
      <v-tab
        :to="{name: 'index'}"
        nuxt
        exact
        class="font-weight-bold"
        :class="{'white--text': themeColorDark}"
        @click="activeTab = '/'"
      >
        Accueil
      </v-tab>
      <v-tab
        v-if="!config.datasetsPage || config.datasetsPage.type !== 'none'"
        :to="{name: 'datasets'}"
        nuxt
        class="font-weight-bold"
        :class="{'white--text': themeColorDark}"
      >
        Les données
      </v-tab>
      <v-tab
        v-if="!config.reusesPage || config.reusesPage.type !== 'none'"
        :to="{name: 'reuses'}"
        nuxt
        class="font-weight-bold"
        :class="{'white--text': themeColorDark}"
      >
        Visualisations
      </v-tab>
      <template v-if="pages">
        <v-tab
          v-for="page in pages.filter(p => p.navigation && p.navigation.type === 'direct')"
          :key="page.id"
          :to="{name: 'pages-id', params: {id: page.id}}"
          nuxt
          class="font-weight-bold"
          :class="{'white--text': themeColorDark}"
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
              class="font-weight-bold"
              :class="{'white--text': themeColorDark}"
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
              :key="page.id"
              :to="{name: 'pages-id', params: {id: page.id}}"
              nuxt
              @click="activeTab = 'hidden'"
            >
              <v-list-item-title>{{ page.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <v-tab
        v-if="config.contactEmail"
        :to="{name: 'contact'}"
        class="font-weight-bold"
        :class="{'white--text': themeColorDark}"
        nuxt
      >
        Contact
      </v-tab>
    </v-tabs>
    <v-spacer />

    <v-toolbar-items>
      <client-only>
        <notifications-queue
          v-if="notifyUrl && config.authentication !== 'none'"
          :notify-url="notifyUrl"
          :login-href="loginHref"
        />
      </client-only>
      <template v-if="initialized && config.authentication !== 'none'">
        <client-only>
          <v-btn
            v-if="!user"
            depressed
            color="primary"
            :href="loginHref"
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
            <v-list outlined class="py-0">
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
                :to="{name: 'me'}"
                :disabled="embed"
                nuxt
              >
                <v-list-item-action><v-icon>mdi-information-outline</v-icon></v-list-item-action>
                <v-list-item-title>Mon compte</v-list-item-title>
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
              <v-list-item :disabled="embed" @click="logout">
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
  import XsMenu from '~/components/layout/xs-menu'
  import NotificationsQueue from '~/components/notifications-queue'
  const { mapState, mapGetters, mapActions } = require('vuex')

  export default {
    components: { XsMenu, NotificationsQueue },
    async fetch() {
      this.pages = (await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages`, { params: { size: 1000, select: 'id,title,navigation', published: true } })).results
    },
    data: () => ({
      pages: null,
      activeTab: null,
    }),
    computed: {
      ...mapState(['config', 'textDark', 'portal']),
      ...mapState('session', ['user', 'initialized']),
      ...mapGetters(['themeColorDark', 'embed', 'directoryUrl', 'dataFairUrl', 'notifyUrl']),
      ...mapGetters('session', ['loginUrl']),
      extraMenus() {
        return (this.pages || []).filter(p => p.navigation && p.navigation.type === 'menu').map(p => p.navigation.title).filter((m, i, s) => s.indexOf(m) === i)
      },
      url () {
        return global.location && global.location.href
      },
      mainDataFairUrl() {
        return process.env.mainDataFairUrl
      },
      backOfficeUrl() {
        let url = this.mainDataFairUrl + '/'
        url += '?account=' + encodeURIComponent(this.config.owner.type + ':' + this.config.owner.id)
        return url
      },
      loginHref() {
        return this.loginUrl(
          this.url,
          false,
          { org: this.config.owner.type === 'organization' ? this.config.owner.id : '', primary: this.config.themeColor },
        )
      },
    },
    methods: {
      ...mapActions('session', ['logout', 'login']),
      reload() {
        window.location.reload()
      },
      setDarkCookie(value) {
        const maxAge = 60 * 60 * 24 * 100 // 100 days
        this.$cookies.set('theme_dark', '' + value, { maxAge })
        this.reload()
      },
    },
  }
</script>

<style lang="css" scoped>
</style>
