<template>
  <v-app v-if="config" style="background-color: #fcfcfc;">
    <dynamic-style />
    <client-only><accept-cookies /></client-only>
    <v-container class="py-0">
      <v-row align="center">
        <v-col
          md="4"
          sm="6"
          cols="12"
          :class="{'pt-1 pb-0': true, 'text-center': $vuetify.breakpoint.xs}"
        >
          <a
            v-if="config.website"
            :href="config.website || '/'"
            style="height:100%"
            class="mr-3"
          >
            <v-img
              :src="logoUrl"
              :alt="config.title"
              contain
              style="height:80px"
            />
          </a>
          <nuxt-link
            v-else
            to="/"
            style="height:100%"
            class="mr-3"
          >
            <v-img
              :src="logoUrl"
              :alt="config.title"
              contain
              style="height:80px"
            />
          </nuxt-link>
        </v-col>
        <v-col
          md="8"
          sm="6"
          cols="12"
          class="pt-1 pb-0"
        >
          <h1 :class="`${$vuetify.breakpoint.xs ? 'headline' : 'display-1'} grey--text text--darken-2 font-weight-bold`">
            {{ config.title }}
          </h1>
        </v-col>
      </v-row>
    </v-container>

    <app-bar />

    <v-main>
      <nuxt-child />
    </v-main>

    <v-footer :class="'pa-0 mt-5 ' + (footerColorDark ? 'area--dark' : 'area--light')" height="auto">
      <v-card
        :color="config.footerColor"
        tile
        width="100%"
      >
        <v-container>
          <v-row>
            <v-col sm="6" cols="12">
              <v-col cols="9" offset="3">
                <v-row>
                  <h3 class="my-3">
                    Portail
                  </h3>
                </v-row>
                <v-row>
                  <a :href="config.cgu ? config.cgu : 'https://koumoul.com/platform/term-of-service'" target="_blank">Conditions d'utilisation</a>
                </v-row>
                <v-row>
                  <nuxt-link v-if="config.analytics && config.analytics.active && config.analytics.type === 'matomo' && config.analytics.params.trackerBase" to="/privacy-policy">
                    Politique de confidentialité
                  </nuxt-link>
                </v-row>
              </v-col>
            </v-col>
            <v-col sm="6" cols="12">
              <v-col cols="9" offset="3">
                <v-row>
                  <h3 class="my-3">
                    Communiquer
                  </h3>
                </v-row>
                <v-row>
                  <a v-if="config.contact" :href="config.contact">Nous contacter</a>
                </v-row>
                <v-row>
                  <a v-if="config.email" :href="'mailto:' + config.email">Par email</a>
                </v-row>
                <v-row>
                  <a v-if="config.website" :href="config.website">Site institutionnel</a>
                </v-row>
                <v-row>
                  <a v-if="config.twitter" :href="'https://twitter.com/' + config.twitter">Twitter</a>
                </v-row>
              </v-col>
            </v-col>
          </v-row>
        </v-container>

        <v-divider :color="footerColorDark ? 'white' : textDark" />

        <v-container class="text-center">
          <span>&copy;2019 — </span><strong><a href="https://koumoul.com">Koumoul</a></strong>
          <!-- Réalisé avec <v-icon color="red" small>mdi-heart</v-icon> par <strong><nuxt-link :to="localePath({name: 'index'})">Koumoul</nuxt-link></strong> -->
        </v-container>
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
      ...mapState(['config', 'textDark']),
      ...mapGetters(['themeColorDark', 'footerColorDark']),
      logoUrl() {
        return `${process.env.publicUrl}/api/v1/portals/${this.$store.state.portalId}/assets/logo`
      },
    },
    head() {
      // For i18n support, see https://github.com/nuxt/nuxtjs.org/blob/master/layouts/default.vue
      const canonical = process.env.publicUrl + this.$route.path
      const link = [
        { rel: 'canonical', href: canonical },
      ]
      link.push({ rel: 'icon', type: 'image/x-icon', href: `${process.env.publicUrl}/api/v1/portals/${this.$store.state.portalId}/assets/favicon` })
      link.forEach((l) => {
        if (l.href.slice(-1) === '/') {
          l.href = l.href.slice(0, -1)
        }
      })
      const meta = [
        { name: 'twitter:card', content: 'summary' },
        { hid: 'og:title', property: 'og:title', content: this.config.title },
        { property: 'og:locale', content: 'fr_FR' },
        { hid: 'og:image', property: 'og:image', content: `${process.env.publicUrl}/api/v1/portals/${this.$store.state.portalId}/assets/home` },
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

</style>
