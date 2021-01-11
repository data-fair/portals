<template>
  <v-app>
    <dynamic-style />
    <client-only><accept-cookies /></client-only>
    <v-main>
      <nuxt-child />
    </v-main>
  </v-app>
</template>

<script>
  import AcceptCookies from '~/components/accept-cookies'
  import DynamicStyle from '~/components/layout/dynamic-style'
  const { mapState } = require('vuex')

  export default {
    components: { AcceptCookies, DynamicStyle },
    data: () => ({
      textDark: '#424242',
    }),
    computed: {
      ...mapState(['config']),
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
