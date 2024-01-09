<template>
  <div>
    <v-container class="py-2">
      <section-title
        v-if="eventsRes"
        :text="eventsRes.count + ' ' + (eventsRes.count> 1 ? 'actualités' : 'actualité')"
        tag="h1"
      />
      <section-title
        v-else
        text="..."
        tag="h1"
      />
    </v-container>
    <v-container v-scroll="onScroll">
      <v-row
        v-if="eventsRes"
        dense
      >
        <v-col
          v-for="(event, i) in eventsRes.results"
          :key="i"
          cols="12"
        >
          <events-card
            layout="horizontal"
            :event="event"
          />
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
        v-if="eventsRes && eventsRes.results.length < eventsRes.count && !loading"
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
      eventsRes: null,
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
    const title = 'Évènements - ' + this.config.title
    const description = 'Évènements passés et à venir.'
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
      return this.publicUrl + '/events'
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
    if (this.eventsRes) this.continueFetch()
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
        template: 'event',
        select: 'id,title,config,topics',
        sort: 'config.datetimes.start:-1'
      }
      params.size = this.size
      params.page = this.page
      if (append) params.count = false
      if (JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
        if (params.q && params.q !== this.lastParams.q && this.$ma) this.$ma.trackEvent({ action: 'search', label: this.search })
        this.lastParams = params
        this.loading = true
        if (!append) this.$router.push({ query })
        const eventsRes = await this.$axios.$get(`/api/v1/portals/${this.portal._id}/pages`, { params })
        if (append) eventsRes.results.forEach(r => this.eventsRes.results.push(r))
        else this.eventsRes = eventsRes
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
      if (html[0].clientHeight >= (html[0].scrollHeight - 300) && this.eventsRes.results.length < this.eventsRes.count) {
        this.refresh(true)
      }
    },
    onScroll (e) {
      if (!this.eventsRes || this.loading) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 300 && this.eventsRes.results.length < this.eventsRes.count) {
        this.refresh(true)
      }
    }
  }
}
</script>

<style>
</style>
