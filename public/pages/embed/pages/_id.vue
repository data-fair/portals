<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <template v-else-if="page">
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
  layout: 'minimal',
  data: () => ({
    page: null,
    images: null
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
      return this.publicUrl + '/embed/pages/' + this.$route.params.id
    }
  },
  watch: {
    async '$route.params.id' () {
      await this.fetchPage()
    }
  },
  methods: {
    async fetchPage () {
      this.page = await this.$axios.$get(this.publicUrl + `/api/v1/portals/${this.portal._id}/pages/` + this.$route.params.id, { params: { html: true } })
      const images = await this.$axios.$get(this.imagesDatasetUrl + '/lines', {
        params: {
          select: 'assetId,_attachment_url',
          qs: `pageId:"${this.$route.params.id}"`,
          thumbnail: '1785x800' // max width of the vertical layout
        }
      })
      this.images = images.results.reduce((a, image) => { a[image.assetId] = image._thumbnail || image._attachment_url; return a }, {})
    }
  }
}
</script>
