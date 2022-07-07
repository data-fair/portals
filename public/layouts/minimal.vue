<template>
  <v-app class="minimal-layout">
    <layout-dynamic-style />
    <client-only><accept-cookies /></client-only>
    <v-main>
      <nuxt-child />
    </v-main>
  </v-app>
</template>

<script>
import AcceptCookies from '~/components/accept-cookies'
const { mapState } = require('vuex')

export default {
  components: { AcceptCookies },
  data: () => ({
    textDark: '#424242'
  }),
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
    ...mapState(['config', 'publicUrl', 'draft', 'portal'])
  }
}

</script>
