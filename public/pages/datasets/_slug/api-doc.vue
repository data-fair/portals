<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <div v-else-if="dataset">
      <layout-full-page-header :breadcrumbs="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Données', to: {name: 'datasets'}, exact: true}, {text: dataset.title, to: {name: 'datasets-slug', params: {slug: dataset.slug}}, exact: true}, {text: 'Documentation d\'API', disabled: true}]" />
      <client-only>
        <v-iframe
          :title="'Documentation de l\'API du jeu de données : ' + dataset.title"
          :src="iframeSrc"
          :style="`height:${windowHeight - 64}px`"
          scrolling="yes"
          :iframe-resizer="false"
          :sync-state="false"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import VIframe from '@koumoul/v-iframe'
import Error from '~/components/error.vue'
import { datasetPageHead } from '~/assets/meta-utils'
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
    this.dataset = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.$route.params.slug, {
      params: {
        html: true,
        publicationSites: 'data-fair-portals:' + this.portal._id
      }
    })
  },
  head () {
    return datasetPageHead(this.dataset, null, this.pageUrl)
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    ...mapGetters(['dataFairUrl', 'openapiViewerUrl']),
    pageUrl () {
      return this.publicUrl + '/datasets/' + this.$route.params.slug + '/api-doc'
    },
    iframeSrc () {
      const apiDocUrl = `${this.dataFairUrl}/api/v1/datasets/${this.dataset.slug}/api-docs.json`
      return `${this.openapiViewerUrl}/?proxy=false&hide-toolbar=true&url=${encodeURIComponent(apiDocUrl)}`
    }
  }
}
</script>
