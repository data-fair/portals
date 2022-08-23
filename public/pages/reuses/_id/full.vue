<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <div v-else-if="application">
      <layout-full-page-header :breadcrumbs="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Visualisations', to: {name: 'reuses'}, exact: true}, {text: application.title, to: {name: 'reuses-id', params: {id: application.id}}, exact: true}, {text: 'Plein écran', disabled: true}]" />
      <client-only>
        <v-iframe
          v-if="embedUrl"
          :src="embedUrl"
          :style="`height:${windowHeight - 64}px`"
          scrolling="yes"
          :iframe-resizer="false"
          @message="receiveMessage"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
import Error from '~/components/error.vue'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { Error, VIframe },
  layout: 'minimal',
  middleware: 'portal-required',
  data: () => ({
    application: null,
    embedUrl: null,
    lastIframeQuery: {}
  }),
  async fetch () {
    this.application = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/applications/' + this.$route.params.id, { params: { html: true } })
  },
  head () {
    if (!this.application) return { title: 'Page non trouvée' }
    const description = (this.application.description || this.application.title).split('</p>').shift().replace('<p>', '')
    return {
      title: this.application.title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:url', property: 'og:url', content: this.pageUrl },
        { hid: 'og:title', property: 'og:title', content: this.application.title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:image', property: 'og:image', content: this.application.href + '/capture' },
        { hid: 'og:image:width', property: 'og:image:width', content: 800 },
        { hid: 'og:image:height', property: 'og:image:height', content: 450 },
        { hid: 'og:type', property: 'og:type', content: 'article' },
        { property: 'article:author', content: this.application.owner.name },
        { property: 'article:modified_time', content: this.application.updatedAt },
        { property: 'article:published_time', content: this.application.createdAt }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: [
        {
          hid: 'schema',
          innerHTML: JSON.stringify({
            '@context': 'http://schema.org',
            '@type': 'WebApplication',
            url: this.url,
            name: this.application.title,
            author: {
              '@type': this.application.owner.type === 'user' ? 'Person' : 'Organization',
              name: this.application.owner.name
            },
            dateCreated: this.application.createdAt,
            datePublished: this.application.createdAt,
            dateModified: this.application.updatedAt,
            publisher: require('~/assets/organization.json'),
            image: {
              '@type': 'imageObject',
              url: this.application.href + '/capture'
            },
            thumbnailUrl: this.application.href + '/capture'
          }),
          type: 'application/ld+json'
        }
      ]
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    ...mapGetters(['readableThemeColor']),
    logoUrl () {
      return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/logo?draft=${this.draft}&hash=${this.config.assets.logo && this.config.assets.logo.hash}`
    },
    pageUrl () {
      return this.publicUrl + '/reuses/' + this.$route.params.id + '/full'
    }
  },
  watch: {
    '$route.query' () {
      this.setEmbedUrl()
    }
  },
  created () {
    this.setEmbedUrl()
  },
  methods: {
    hasQueryChange (query = {}) {
      if (Object.keys(query).find(key => query[key] !== this.lastIframeQuery[key])) return true
      if (Object.keys(this.lastIframeQuery).find(key => this.lastIframeQuery[key] !== query[key])) return true
      return false
    },
    async setEmbedUrl () {
      const query = { ...this.$route.query, embed: true, primary: this.readableThemeColor }
      delete query.portalId
      if (!this.hasQueryChange(query)) return
      this.lastIframeQuery = query

      const url = new URL(`${this.$store.getters.dataFairUrl}/app/${this.$route.params.id}`)
      Object.keys(query).forEach(key => url.searchParams.append(key, query[key]))
      this.embedUrl = url.href
    },
    receiveMessage (msg) {
      if (!msg.query) return
      if (!this.hasQueryChange(msg.query)) return
      this.lastIframeQuery = { ...msg.query }

      if (msg.query.primary) delete msg.query.primary
      if (this.$route.query.portalId) msg.query.portalId = this.$route.query.portalId
      this.$router.push({ name: this.$route.name, params: this.$route.params, query: msg.query })
    }
  }
}
</script>
