<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <div v-else-if="dataset">
      <layout-full-page-header :breadcrumbs="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Données', to: {name: 'datasets'}, exact: true}, {text: dataset.title, to: {name: 'datasets-ref', params: {ref: $route.params.ref}}, exact: true}, {text: 'Vue tabulaire', disabled: true}]" />
      <client-only>
        <d-frame-wrapper
          :iframe-title="'Vue tableau du jeu de données : ' + dataset.title"
          :src="tablePreview"
          class="fill-height"
          resize="no"
          scrolling="no"
          sync-params
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import { datasetPageHead } from '~/assets/meta-utils'
import Error from '~/components/error.vue'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    Error,
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
  layout: 'minimal',
  middleware: 'portal-required',
  data: () => ({
    dataset: null
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
    return datasetPageHead(this.dataset, null, this.pageUrl, true)
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    ...mapGetters(['dataFairUrl', 'readablePrimaryColor']),
    tablePreview () {
      return this.dataFairUrl + process.env.embeds.table.replace('{id}', this.$route.params.ref)
    },
    pageUrl () {
      return this.publicUrl + '/datasets/' + this.$route.params.ref + '/full'
    }
  }
}
</script>
