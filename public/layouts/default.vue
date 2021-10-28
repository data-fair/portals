<template>
  <v-app v-if="config">
    <dynamic-style />
    <client-only><accept-cookies /></client-only>
    <layout-header />

    <app-bar class="mb-3" />

    <v-main>
      <nuxt-child />
      <client-only><layout-notifications /></client-only>
    </v-main>

    <v-footer :class="'pa-0 mt-5 ' + (footerColorDark ? 'area--dark' : 'area--light')" height="auto">
      <v-card
        :color="config.footerColor"
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
  import AcceptCookies from '~/components/accept-cookies'
  import AppBar from '~/components/layout/app-bar'
  import DynamicStyle from '~/components/layout/dynamic-style'
  const { mapState, mapGetters } = require('vuex')

  export default {
    components: { AcceptCookies, AppBar, DynamicStyle },
    computed: {
      ...mapState(['config', 'textDark', 'portal', 'draft', 'publicUrl']),
      ...mapGetters(['themeColorDark', 'footerColorDark']),
    },
    head() {
      // For i18n support, see https://github.com/nuxt/nuxtjs.org/blob/master/layouts/default.vue
      const canonical = this.publicUrl + this.$route.path
      const link = [
        { rel: 'canonical', href: canonical },
      ]
      link.push({ rel: 'icon', type: 'image/x-icon', href: `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/favicon?draft=${this.draft}` })
      link.forEach((l) => {
        if (l.href.slice(-1) === '/') {
          l.href = l.href.slice(0, -1)
        }
      })
      const meta = [
        { name: 'twitter:card', content: 'summary' },
        { hid: 'og:title', property: 'og:title', content: this.config.title },
        { property: 'og:locale', content: 'fr_FR' },
        { hid: 'og:image', property: 'og:image', content: `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/home?draft=${this.draft}` },
        { hid: 'og:image:width', property: 'og:image:width', content: 567 },
        { hid: 'og:image:height', property: 'og:image:height', content: 383 },
      ]
      if (this.config.twitter) meta.push({ name: 'twitter:site', content: this.config.twitter })
      return {
        meta,
        link,
      }
    },
  }

</script>

<style>
@media only screen and (min-width: 1904px){
  .container.padded {
    max-width:100%!important;
  }

  .container {
    max-width:1315px!important;
  }
}

iframe {
  background-color: transparent;
  border: none;
}

.v-tabs__slider {
    height: 4px!important;
}

.v-card__text, .v-card__title {
  word-break: normal; /* maybe !important  */
}
</style>
