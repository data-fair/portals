<template>
  <v-app v-if="config">
    <layout-dynamic-style />
    <client-only><accept-cookies /></client-only>
    <layout-header />

    <app-bar class="mb-3" />

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
const { mapState, mapGetters } = require('vuex')

export default {
  components: { AcceptCookies, AppBar },
  head () {
    // For i18n support, see https://github.com/nuxt/nuxtjs.org/blob/master/layouts/default.vue
    const canonical = this.publicUrl + this.$route.path
    const link = [
      { rel: 'canonical', href: canonical }
    ]
    link.push({ rel: 'icon', type: 'image/x-icon', href: `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/favicon?draft=${this.draft}&hash=${this.config.assets.favicon && this.config.assets.favicon.hash}` })
    link.forEach((l) => {
      if (l.href.slice(-1) === '/') {
        l.href = l.href.slice(0, -1)
      }
    })
    const fonts = []
    if (this.config.bodyFont) fonts.push(this.config.bodyFont.name)
    if (this.config.headingsFont) fonts.push(this.config.headingsFont.name)
    if (fonts.length) {
      link.push({ rel: 'stylesheet', href: `https://fonts.googleapis.com/css?family=${fonts.join('|')}&display=swap` })
    }
    const meta = [
      { name: 'twitter:card', content: 'summary' },
      { hid: 'og:title', property: 'og:title', content: this.config.title },
      { property: 'og:locale', content: 'fr_FR' },
      { hid: 'og:image', property: 'og:image', content: `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/home?draft=${this.draft}&hash=${this.config.assets.home && this.config.assets.home.hash}` },
      { hid: 'og:image:width', property: 'og:image:width', content: 567 },
      { hid: 'og:image:height', property: 'og:image:height', content: 383 }
    ]
    if (this.config.twitter) meta.push({ name: 'twitter:site', content: this.config.twitter })
    return {
      meta,
      link
    }
  },
  computed: {
    ...mapState(['config', 'textDark', 'portal', 'draft', 'publicUrl']),
    ...mapGetters(['themeColorDark', 'footerColorDark'])
  }
}

</script>

<style>
@media only screen and (min-width: 1904px){
  .container.padded {
    max-width:100%!important;
  }

  .container:not(.container--fluid) {
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

/* used to display descriptions in dataset cards with bottom gradient */
.dataset-desc170:before {
  content:'';
  width:100%;
  height:82px;
  position:absolute;
  left:0;
  top:160px;
  background:linear-gradient(transparent 0, white);
}
.dataset-desc200:before {
  content:'';
  width:100%;
  height:72px;
  position:absolute;
  left:0;
  top:200px;
  background:linear-gradient(transparent 0, white);
}

/* select-sort class is used in applications and datasets lists */
.select-sort .v-input__append-outer {
  margin-top: 0px !important;
  margin-bottom: 0px !important;
}
</style>
