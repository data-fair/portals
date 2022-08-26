<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <div v-else-if="dataset">
      <layout-full-page-header :breadcrumbs="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Données', to: {name: 'datasets'}, exact: true}, {text: dataset.title, to: {name: 'datasets-id', params: {id: dataset.id}}, exact: true}, {text: 'Plein écran', disabled: true}]" />
      <client-only>
        <v-iframe
          :src="`${dataFairUrl}/embed/dataset/${$route.params.id}${tablePreviewPath}`"
          :style="`height:${windowHeight - 64}px`"
          scrolling="yes"
          :iframe-resizer="false"
          :sync-state="true"
          :query-params-extra="{primary: config.themeColor}"
          :query-params-exclude="['portalId']"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import VIframe from '@koumoul/v-iframe'
import Error from '~/components/error.vue'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { Error, VIframe },
  layout: 'minimal',
  middleware: 'portal-required',
  data: () => ({
    dataset: null,
    tablePreviewPath: process.env.tablePreviewPath
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
    ...mapGetters(['dataFairUrl']),
    pageUrl () {
      return this.publicUrl + '/datasets/' + this.$route.params.id + '/full'
    }
  }
}
</script>
