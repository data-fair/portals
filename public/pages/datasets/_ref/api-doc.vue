<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <div v-else-if="dataset">
      <layout-full-page-header :breadcrumbs="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Données', to: {name: 'datasets'}, exact: true}, {text: dataset.title, to: {name: 'datasets-ref', params: {ref: $route.params.ref}}, exact: true}, {text: 'Documentation d\'API', disabled: true}]" />
      <p
        v-if="useReadApiKey && actualReadApiKey"
        class="my-0 mx-2"
      >
        Cette API peut être utilisée sans authentification grâce à une clé que vous pouvez renseigner dans le paramètre de requête "apiKey". La clé est régulièrement renouvellée, elle expirera le {{ $d(new Date(dataset.readApiKey.expiresAt)) }}.
        <br>
        Utilisation de la clé : <a :href="readApiKeyExample">{{ readApiKeyExample }}</a>
      </p>
      <client-only>
        <d-frame-wrapper
          :title="'Documentation de l\'API du jeu de données : ' + dataset.title"
          :src="iframeSrc"
          :height="`${windowHeight - 64}px`"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import Error from '~/components/error.vue'
import { datasetPageHead } from '~/assets/meta-utils'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    Error,
    DFrameWrapper: () => process.client ? import('../../../components-no-autoload/d-frame-wrapper.vue') : null
  },
  layout: 'minimal',
  middleware: 'portal-required',
  data: () => ({
    dataset: null,
    actualReadApiKey: null
  }),
  async fetch () {
    this.dataset = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.$route.params.ref, {
      params: {
        html: true,
        publicationSites: 'data-fair-portals:' + this.portal._id
      }
    })
    if (this.useReadApiKey) {
      this.actualReadApiKey = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.$route.params.ref + '/read-api-key')
    }
  },
  head () {
    return datasetPageHead(this.dataset, null, this.pageUrl, true)
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    ...mapGetters(['dataFairUrl', 'openapiViewerUrl']),
    pageUrl () {
      return this.publicUrl + '/datasets/' + this.$route.params.ref + '/api-doc'
    },
    iframeSrc () {
      return `${this.openapiViewerUrl}/?urlType=dataset&id=${this.$route.params.ref}`
    },
    useReadApiKey () {
      return this.dataset.userPermissions.includes('getReadApiKey') && this.dataset.readApiKey?.active
    },
    readApiKeyExample () {
      return `${this.dataFairUrl}/api/v1/datasets/${this.$route.params.ref}/lines?apiKey=${this.actualReadApiKey?.current}`
    }
  }
}
</script>
