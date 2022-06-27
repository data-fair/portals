<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <div v-else-if="dataset">
      <v-container class="py-0">
        <v-row align="start">
          <v-col
            md="4"
            sm="6"
            cols="12"
            :class="{'pt-3 pb-0': true, 'text-center': $vuetify.breakpoint.xs}"
          >
            <a
              v-if="config.website"
              :href="config.website || '/'"
              class="mr-3"
            >
              <img
                :src="logoUrl"
                :alt="config.title"
                style="height:68px"
              >
            </a>
            <nuxt-link
              v-else
              to="/"
              class="mr-3"
            >
              <img
                :src="logoUrl"
                :alt="config.title"
                style="height:68px"
              >
            </nuxt-link>
          </v-col>
          <v-col
            md="8"
            sm="6"
            cols="12"
            :class="{'pt-3 pb-0': true, 'text-center': $vuetify.breakpoint.xs}"
          >
            <v-breadcrumbs
              :large="!$vuetify.breakpoint.xs"
              :items="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Les données', to: {name: 'datasets'}, exact: true}, {text: dataset.title, to: {name: 'datasets-id', params: {id: dataset.id}}, exact: true}, {text: 'Plein écran', disabled: true}]"
            >
              <template slot="divider">
                <v-icon>mdi-chevron-right</v-icon>
              </template>
            </v-breadcrumbs>
          </v-col>
        </v-row>
      </v-container>
      <v-divider />
      <client-only>
        <v-iframe
          v-if="embedUrl"
          :src="embedUrl"
          :style="`height:${windowHeight - 87}px`"
          @message="receiveMessage"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import VIframe from '@koumoul/v-iframe'
import Error from '~/components/error.vue'
const { mapState } = require('vuex')

export default {
  components: { Error, VIframe },
  layout: 'minimal',
  middleware: 'portal-required',
  data: () => ({
    dataset: null,
    embedUrl: null,
    lastIframeQuery: {}
  }),
  async fetch () {
    this.dataset = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.$route.params.id, { params: { html: true } })
  },
  head () {
    if (this.dataset) {
      const description = (this.dataset.description || this.dataset.title).split('</p>').shift().replace('<p>', '')
      const schema = {
        '@context': 'http://schema.org',
        '@type': 'Dataset',
        url: this.pageUrl,
        name: this.dataset.title,
        description,
        author: {
          '@type': this.dataset.owner.type === 'user' ? 'Person' : 'Organization',
          name: this.dataset.owner.name
        },
        creator: {
          '@type': this.dataset.owner.type === 'user' ? 'Person' : 'Organization',
          name: this.dataset.owner.name
        },
        dateCreated: this.dataset.createdAt,
        dateModified: this.dataset.dataUpdatedAt,
        sdPublisher: require('~/assets/organization.json'),
        sdDatePublished: this.dataset.createdAt,
        encodingFormat: 'application/json',
        citation: this.dataset.origin
      }
      if (this.dataset.bbox) {
        schema.spatialCoverage = {
          '@type': 'Place',
          geo: {
            '@type': 'GeoShape',
            box: this.dataset.bbox.slice(0, 2).join(',') + ' ' + this.dataset.bbox.slice(2, 4).join(',')
          }
        }
      }
      if (this.dataset.license && this.dataset.license.href) schema.license = this.dataset.license.href
      if (this.applications && this.applications.count) {
        schema.image = {
          '@type': 'imageObject',
          url: this.applications.results[0].href + '/capture'
        }
        schema.thumbnailUrl = this.applications.results[0].href + '/capture'
      }
      const meta = [
        { hid: 'description', name: 'description', content: description },
        { property: 'og:url', content: this.pageUrl },
        { hid: 'og:title', property: 'og:title', content: this.dataset.title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'article:author', content: this.dataset.owner.name },
        { property: 'article:modified_time', content: this.dataset.dataUpdatedAt },
        { property: 'article:published_time', content: this.dataset.createdAt }
      ]
      if (this.applications && this.applications.count) {
        meta.push({ hid: 'og:image', property: 'og:image', content: this.applications.results[0].href + '/capture' })
        meta.push({ hid: 'og:image:width', property: 'og:image:width', content: 800 })
        meta.push({ hid: 'og:image:height', property: 'og:image:height', content: 450 })
      }
      return {
        title: this.dataset.title,
        meta,
        __dangerouslyDisableSanitizers: ['script'],
        script: [
          {
            hid: 'schema',
            innerHTML: JSON.stringify(schema),
            type: 'application/ld+json'
          }
        ]
      }
    } else {
      return { title: 'Page non trouvée' }
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    logoUrl () {
      return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/logo?draft=${this.draft}&hash=${this.config.assets.logo && this.config.assets.logo.hash}`
    },
    pageUrl () {
      return this.publicUrl + '/datasets/' + this.$route.params.id + '/full'
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
      const query = { ...this.$route.query, primary: this.config.themeColor }
      delete query.portalId
      if (!this.hasQueryChange(query)) return
      this.lastIframeQuery = query

      const url = new URL(`${this.$store.getters.dataFairUrl}/embed/dataset/${this.$route.params.id}/table`)
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
