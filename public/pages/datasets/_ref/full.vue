<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <div v-else-if="dataset">
      <layout-full-page-header :breadcrumbs="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Données', to: {name: 'datasets'}, exact: true}, {text: dataset.title, to: {name: 'datasets-ref', params: {ref: $route.params.ref}}, exact: true}, {text: 'Vue tabulaire', disabled: true}]" />
      <client-only>
        <v-iframe
          :title="'Vue tableau du jeu de données : ' + dataset.title"
          :src="`${dataFairUrl}/embed/dataset/${$route.params.ref}${tablePreviewPath}`"
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
import { datasetPageHead } from '~/assets/meta-utils'
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
    this.dataset = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.$route.params.ref, {
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
    ...mapGetters(['dataFairUrl']),
    pageUrl () {
      return this.publicUrl + '/datasets/' + this.$route.params.ref + '/full'
    }
  }
}
</script>
