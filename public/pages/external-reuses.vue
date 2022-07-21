<template>
  <div>
    <!-- <v-container py-0>
      <v-breadcrumbs :items="[{text: 'Les données', to: '/datasets', exact: true}, {text: dataset.title, disabled: true}]"/>
    </v-container>
    <v-divider/> -->
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <v-container v-else-if="datasets">
      <template v-for="dataset in datasets.results.filter(d => d.extras && d.extras.externalReuses && d.extras.externalReuses.length)">
        <nuxt-link
          :key="'title-' + dataset.id"
          :to="`/datasets/${dataset.id}`"
        >
          <h3 class="headline grey--text text--darken-2 font-weight-bold mt-6 mb-4">
            {{ dataset.title }}
          </h3>
        </nuxt-link>
        <dataset-external-reuses
          :key="'reuses-' + dataset.id"
          :dataset="dataset"
        />
      </template>
    </v-container>
  </div>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
const { mapState, mapGetters } = require('vuex')

export default {
  middleware: 'portal-required',
  data: function () {
    return {
      datasets: null,
      loading: false
    }
  },
  async fetch () {
    await this.refresh()
  },
  head () {
    const title = 'Datasets - ' + this.config.title
    const description = 'Parcourez la liste des réutilisations de nos jeux de données.'
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:url', property: 'og:url', content: this.url },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ]
    }
  },
  computed: {
    ...mapState(['config', 'portal', 'publicUrl', 'draft']),
    ...mapGetters(['owner']),
    url () {
      return this.publicUrl + '/external-reuses'
    }
  },
  methods: {
    async refresh () {
      const params = {
        size: 10000,
        raw: true,
        owner: this.owner,
        publicationSites: 'data-fair-portals:' + this.portal._id,
        select: 'id,title,extras.externalReuses'
      }
      if (this.config.authentication === 'none') params.visibility = 'public'
      this.loading = true
      const datasets = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets', { params })
      this.datasets = datasets
      this.loading = false
    }
  }
}
</script>

<style>

</style>
