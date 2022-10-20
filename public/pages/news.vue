<template>
  <div>
    <v-container class="py-2">
      <section-title
        v-if="newsRes"
        :text="newsRes.count + ' ' + (newsRes.count> 1 ? 'actualités' : 'actualité')"
      />
      <section-title
        v-else
        text="..."
      />
    </v-container>
    <v-container v-scroll="onScroll">
      <v-row v-if="newsRes">
        <v-col
          v-for="(news, i) in newsRes.results"
          :key="i"
          cols="12"
        >
          <news-card
            :news="news"
          />
          <v-divider v-if="i < newsRes.count - 1" />
        </v-col>
      </v-row>
      <v-row
        class="pt-5 pb-0"
        align="center"
      >
        <v-col class="text-center pa-0">
          <v-progress-circular
            v-if="loading"
            :size="40"
            :width="5"
            :color="'primary'"
            indeterminate
          />
          <div
            v-else
            style="height: 40px;"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="newsRes && newsRes.results.length < newsRes.count && !loading"
        class="pt-5 pb-0"
        align="center"
      >
        <v-col class="text-center pa-0">
          <v-btn
            text
            @click="refresh(true)"
          >
            voir plus
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  middleware: 'portal-required',
  data: function () {
    return {
      newsRes: null,
      size: 12,
      page: 1,
      search: '',
      loading: false,
      lastParams: {}
    }
  },
  async fetch () {
    this.readQueryParams()
    await this.refresh()
  },
  head () {
    const title = 'Actualités - ' + this.config.title
    const description = 'Découvrez nos actualités.'
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
      return this.publicUrl + '/news'
    }
  },
  watch: {
    async $route (to, from) {
      this.readQueryParams()
      await this.refresh()
    }
  },
  mounted () {
    // case where SSR already fetched the first page
    if (this.newsRes) this.continueFetch()
  },
  methods: {
    readQueryParams () {
      // nothing yet
    },
    async refresh (append) {
      if (append) this.page += 1
      else this.page = 1
      const query = {}
      const params = {
        ...query,
        html: true,
        published: true,
        template: 'news',
        select: 'id,title,config,publishedAt,published',
        sort: 'publishedAt:-1'
      }
      params.size = this.size
      params.page = this.page
      if (append) params.count = false
      if (JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
        if (params.q && params.q !== this.lastParams.q && this.$ma) this.$ma.trackEvent({ action: 'search', label: this.search })
        this.lastParams = params
        this.loading = true
        if (!append) this.$router.push({ query })
        const newsRes = await this.$axios.$get(`/api/v1/portals/${this.portal._id}/pages`, { params })
        if (append) newsRes.results.forEach(r => this.newsRes.results.push(r))
        else this.newsRes = newsRes
        this.loading = false

        // if the page is too large for the user to trigger a scroll we append results immediately
        if (process.client) {
          await this.$nextTick()
          await this.$nextTick()
          this.continueFetch()
        }
      }
    },
    continueFetch () {
      const html = document.getElementsByTagName('html')
      if (html[0].scrollHeight === html[0].clientHeight && this.newsRes.results.length < this.newsRes.count) {
        this.refresh(true)
      }
    },
    onScroll (e) {
      if (!this.newsRes || this.loading) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 300 && this.newsRes.results.length < this.newsRes.count) {
        this.refresh(true)
      }
    }
  }
}
</script>

<style>
</style>
