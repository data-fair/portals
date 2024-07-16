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
  layout: 'default',
  middleware: 'portal-required',
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
      return this.publicUrl + '/pages/' + this.$route.params.id
    }
  },
  watch: {
    async '$route.params.id' () {
      await this.fetchPage()
    }
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
