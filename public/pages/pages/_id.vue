<template lang="html">
  <div ref="renderedPage">
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <template v-else-if="page">
      <pages-embed
        :page="page"
        :height="height"
      />
      <pages-blank
        v-if="page.template === 'blank'"
        :page="page"
        :images="images"
      />
      <pages-thematic
        v-if="page.template === 'thematic'"
        :page="page"
        :images="images"
      />
      <pages-news
        v-if="page.template === 'news'"
        :page="page"
        :images="images"
      />
      <pages-event
        v-if="page.template === 'event'"
        :page="page"
        :images="images"
      />
    </template>
  </div>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  layout: 'default',
  middleware: 'portal-required',
  data: () => ({
    page: null,
    images: null,
    height: 500
  }),
  async fetch () {
    await this.fetchPage()
  },
  head () {
    if (this.page) {
      return { title: this.page.title }
    } else {
      return { title: 'Page non trouvée' }
    }
  },
  computed: {
    ...mapState(['portal', 'publicUrl']),
    ...mapGetters(['imagesDatasetUrl']),
    url () {
      return this.publicUrl + '/pages/' + this.$route.params.id
    }
  },
  watch: {
    async '$route.params.id' () {
      await this.fetchPage()
    }
  },
  mounted () {
    setTimeout(() => {
      if (this.$refs && this.$refs.renderedPage) this.height = this.$refs.renderedPage.clientHeight
    }, 2000)
  },
  methods: {
    async fetchPage () {
      [this.page, this.images] = await Promise.all([
        this.$axios.$get(this.publicUrl + `/api/v1/portals/${this.portal._id}/pages/` + this.$route.params.id, { params: { html: true } }),
        this.$store.dispatch('fetchPageImages', this.$route.params.id)
      ])
    }
  }
}
</script>
