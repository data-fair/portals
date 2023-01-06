<template>
  <v-app v-if="config">
    <client-only><accept-cookies /></client-only>

    <!-- header and navigation -->
    <layout-app-bar />

    <v-main class="mt-3">
      <v-row
        v-if="config.homeImageAlwaysVisible && $route.name !== 'index'"
        justify="center"
        class="ma-0"
      >
        <v-img
          :src="homeUrl"
          :alt="config.title"
          height="250px"
          max-width="1904px"
          :class="`elevation-${appBarElevation}`"
          :style="`margin-top: ${config.appBarTransparency ? -77 : -12}px;`"
        />
      </v-row>
      <nuxt-child />
      <client-only><layout-notifications /></client-only>
    </v-main>

    <layout-scroll-to-top />

    <layout-contact-footer v-if="config.contactFooter" />
    <v-footer
      :class="'main-footer pa-0 ' + (footerColorDark ? 'area--dark ' : 'area--light ') + (config.contactFooter ? 'mt-0' : 'mt-5')"
      height="auto"
    >
      <v-card
        :color="footerColor"
        tile
        width="100%"
      >
        <layout-footer />

        <template v-if="!config.footerCopyrightAsLogo">
          <v-divider :dark="footerColorDark" />
          <v-container class="text-center py-1">
            <span>&copy;{{ new Date().getFullYear() }} — </span><strong><a href="https://koumoul.com">Koumoul</a></strong>
            <!-- Réalisé avec <v-icon color="red" small>mdi-heart</v-icon> par <strong><nuxt-link :to="localePath({name: 'index'})">Koumoul</nuxt-link></strong> -->
          </v-container>
        </template>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  head () {
    return this.portalHead(this.$route, this.$i18n.locale, true, 'scroll')
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    ...mapGetters(['footerColor', 'footerColorDark', 'portalHead', 'appBarElevation']),
    homeUrl () {
      console.log('portal ?', this.portal)
      return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/home?draft=${this.draft}&hash=${this.config.assets.home && this.config.assets.home.hash}`
    }
  }
}
</script>

<style>
</style>
