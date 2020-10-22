<template lang="html">
  <div>
    <error v-if="$fetchState.error" :error="$fetchState.error" />
    <div v-else-if="application">
      <v-container class="py-0">
        <v-breadcrumbs :items="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Visualisations', to: {name: 'reuses'}, exact: true}, {text: application.title, to: {name: 'reuses-id', params: {id: application.id}}, exact: true}, {text: 'Plein écran', disabled: true}]">
          <template slot="divider">
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </v-container>
      <v-divider />
      <iframe
        id="reuse-frame-full"
        :src="embedUrl + '?embed=true'"
        style="height:calc(100vh - 68px)"
        width="100%"
        @load="iframeLoaded"
      />
    </div>
  </div>
</template>

<script>
import iFrameResize from 'iframe-resizer/js/iframeResizer'
import Error from '~/components/error.vue'
const { mapState } = require('vuex')
const marked = require('@hackmd/meta-marked')

export default {
  layout: 'minimal',
  components: { Error },
  async fetch () {
    this.application = await this.$axios.$get(process.env.dataFairUrl + '/api/v1/applications/' + this.$route.params.id, { withCredentials: true })
  },
  data: () => ({
    marked,
    application: null
  }),
  computed: {
    ...mapState(['publicUrl']),
    ...mapState('session', ['user']),
    pageUrl() {
      return process.env.publicUrl + '/reuses/' + this.$route.params.id + '/full'
    },
    embedUrl() {
      return process.env.dataFairUrl + '/app/' + this.$route.params.id
    }
  },
  methods: {
    iframeLoaded () {
      iFrameResize({ log: false }, '#reuse-frame-full')
    }
  },
  head () {
    if (!this.application) return { title: 'Page non trouvée' }
    const description = marked(this.application.description || this.application.title).html.split('</p>').shift().replace('<p>', '')
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
  }
}
</script>
