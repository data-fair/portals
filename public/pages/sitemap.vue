<!-- eslint-disable vue/no-parsing-error -->
<template>
  <v-container>
    <h2 class="headline grey--text text--darken-3 font-weight-bold my-6">
      Plan du site
    </h2>
    <p
      v-for="page in sitemapShort"
      :key="page.to"
    >
      <nuxt-link
        :to="page.to"
        class="primary--text underline-link"
      >
        {{ page.title }}
      </nuxt-link>
    </p>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  middleware: 'portal-required',
  async fetch () {
    if (!this.pages) await this.$store.dispatch('fetchPages')
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
    ...mapGetters(['sitemapShort'])
  }
}
</script>

<style>

</style>
