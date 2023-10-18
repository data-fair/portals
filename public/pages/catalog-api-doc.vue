<template lang="html">
  <div>
    <div>
      <layout-full-page-header :breadcrumbs="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Données', to: {name: 'datasets'}, exact: true}, {text: 'Documentation d\'API', disabled: true}]" />
      <client-only>
        <v-iframe
          :title="'Documentation du cataloge de jeux de données'"
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
const { mapState, mapGetters } = require('vuex')

export default {
  components: { VIframe },
  layout: 'minimal',
  middleware: 'portal-required',
  head () {
    const title = 'Données - ' + this.config.title
    const description = 'Trouvez facilement toutes les données que nous avons publiées grâce à notre moteur de recherche.'
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:url', property: 'og:url', content: this.url },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ]
      // TODO add DataCatalog schema
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    ...mapGetters(['dataFairUrl', 'openapiViewerUrl']),
    pageUrl () {
      return this.publicUrl + '/catalog-api-doc'
    },
    iframeSrc () {
      const apiDocUrl = `${this.dataFairUrl}/api/v1/catalog/api-docs.json`
      return `${this.openapiViewerUrl}/?proxy=false&hide-toolbar=true&url=${encodeURIComponent(apiDocUrl)}`
    }
  }
}
</script>
