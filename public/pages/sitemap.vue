<!-- eslint-disable vue/no-parsing-error -->
<template>
  <v-container>
    <h2 class="headline grey--text text--darken-3 font-weight-bold mt-6 mb-4">
      Plan du site
    </h2>
    <v-list>
      <v-list-item
        v-for="page in sitemap"
        :key="page.to"
        :to="page.to"
        class="primary--text"
      >
        {{ page.title }}
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  middleware: 'portal-required',
  async fetch () {
    const promises = []
    if (!this.pages) promises.push(this.$store.dispatch('fetchPages'))
    if (!this.datasetsList) promises.push(this.$store.dispatch('fetchDatasetsList'))
    if (!this.applicationsList) promises.push(this.$store.dispatch('fetchApplicationsList'))
    if (promises.length) await Promise.all(promises)
  },
  head () {
    const title = 'Plan du site - ' + this.config.title
    return {
      title,
      meta: [
        { hid: 'og:url', property: 'og:url', content: this.publicUrl + '/sitemap' },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ]
    }
  },
  computed: {
    ...mapState(['publicUrl', 'config', 'pages', 'datasetsList', 'applicationsList']),
    ...mapGetters(['sitemap'])
  }
}
</script>

<style>

</style>
