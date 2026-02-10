<template lang="html">
  <div>
    <div>
      <layout-full-page-header :breadcrumbs="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Données', to: {name: 'datasets'}, exact: true}, {text: 'Documentation d\'API', disabled: true}]" />
      <client-only>
        <d-frame-wrapper
          :src="`${openapiViewerUrl}/?urlType=catalog`"
          :height="`${windowHeight - 64}px`"
          iframe-title="Documentation de l'API du catalogue"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    DFrameWrapper: () => process.client ? import('../components-no-autoload/d-frame-wrapper.vue') : null
  },
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
    }
  }
}
</script>
