<!-- eslint-disable vue/no-parsing-error -->
<template>
  <xml>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
    >
      <url
        v-for="page in sitemapFull"
        :key="page.to"
      >
        <loc v-text="fullURL(page.to)" />
        <lastmod
          v-if="page.updatedAt"
          v-text="page.updatedAt"
        />
        <priority
          v-if="page.priority"
          v-text="page.priority"
        />
      </url>
    </urlset>
  </xml>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  layout: 'empty',
  async fetch () {
    await Promise.all([
      this.$store.dispatch('fetchPages'),
      this.$store.dispatch('fetchDatasetsList'),
      this.$store.dispatch('fetchApplicationsList'),
      this.$store.dispatch('fetchUsesList')
    ])
  },
  computed: {
    ...mapState(['publicUrl', 'portal']),
    ...mapGetters(['sitemapFull', 'isPublished'])
  },
  methods: {
    fullURL (to) {
      let url = this.publicUrl + to
      if (!this.isPublished) {
        url += '?portalId=' + this.portal._id
      }
      return url
    }
  }
}
</script>

<style>

</style>
