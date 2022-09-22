<template>
  <v-app v-if="config">
    <layout-dynamic-style html-overflow="scroll" />
    <client-only><accept-cookies /></client-only>

    <!-- header and navigation -->
    <layout-app-bar />

    <v-main>
      <nuxt-child />
      <client-only><layout-notifications /></client-only>
    </v-main>

    <layout-scroll-to-top />

    <v-footer
      :class="'pa-0 mt-5 ' + (footerColorDark ? 'area--dark' : 'area--light')"
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
    return this.portalHead(this.$route)
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['footerColor', 'footerColorDark', 'portalHead'])
  }
}

</script>

<style>
</style>
