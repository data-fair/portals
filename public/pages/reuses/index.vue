<template>
  <div>
    <v-container class="py-2">
      <section-title
        v-if="applications"
        :text="applications.count + ' ' + (applications.count> 1 ? 'visualisations' : 'visualisation')"
      />
      <section-title
        v-else
        text="..."
      />
      <v-row align="center">
        <v-col
          class="py-0"
          cols="12"
          sm="6"
          md="4"
        >
          <v-text-field
            v-model="search"
            :autofocus="!draft"
            label="Rechercher"
            outlined
            dense
            append-icon="mdi-magnify"
            class="mb-2"
            hide-details
            @keyup.enter.native="refresh()"
            @click:append="refresh()"
          />
        </v-col>
        <v-col
          class="py-0"
          cols="12"
          sm="6"
          md="4"
        >
          <v-select
            v-model="filters.apps"
            :loading="loading"
            :items="baseApplicationsItems"
            item-text="value.title"
            item-value="value.url"
            multiple
            clearable
            outlined
            dense
            class="mb-2"
            hide-details
            label="Filtrer par application"
            no-data-text="Aucun concept"
            @input="refresh()"
          />
        </v-col>
        <v-col
          class="py-0"
          cols="12"
          sm="6"
          md="4"
        >
          <v-select
            v-model="sort"
            outlined
            dense
            :items="sorts"
            label="Trier par"
            hide-details
            class="select-sort mb-2"
            @input="refresh()"
          >
            <template #append-outer>
              <v-btn-toggle
                v-model="order"
                mandatory
                dense
                class="ma-0"
                @change="refresh()"
              >
                <v-tooltip top>
                  <template #activator="{ on }">
                    <v-btn
                      text
                      :height="40"
                      v-on="on"
                    >
                      <v-icon>mdi-sort-descending</v-icon>
                    </v-btn>
                  </template>
                  <span>Décroissant</span>
                </v-tooltip>
                <v-tooltip top>
                  <template #activator="{ on }">
                    <v-btn
                      text
                      :height="40"
                      v-on="on"
                    >
                      <v-icon>mdi-sort-ascending</v-icon>
                    </v-btn>
                  </template>
                  <span>Croissant</span>
                </v-tooltip>
              </v-btn-toggle>
            </template>
          </v-select>
        </v-col>
      </v-row>
      <topics-facets
        v-if="topicsItems.length"
        :items="topicsItems"
        @toggle="toggleTopic"
      />
    </v-container>
    <v-container v-scroll="onScroll">
      <v-row v-if="applications">
        <v-col
          v-for="(application, i) in applications.results"
          :key="i"
          xl="3"
          md="4"
          sm="6"
          cols="12"
        >
          <application-card :application="application" />
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
        v-if="applications && applications.results.length < applications.count && !loading"
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
import ApplicationCard from '~/components/application/card.vue'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    ApplicationCard
  },
  middleware: 'portal-required',
  data: function () {
    return {
      applications: null,
      size: 12,
      page: 1,
      search: '',
      loading: false,
      sort: '',
      order: 0,
      filters: {
        apps: [],
        topics: []
      },
      sorts: [{
        text: 'Date de création',
        value: 'createdAt'
      }, {
        text: 'Date de mise à jour',
        value: 'updatedAt'
      }, {
        text: 'Ordre alphabétique',
        value: 'title'
      }],
      lastParams: {}
    }
  },
  async fetch () {
    this.readQueryParams()
    await this.refresh()
  },
  head () {
    const title = 'Dataviz - ' + this.config.title
    const description = 'Découvrez toutes les visualisations de données que nous avons réalisées grâce à notre moteur de recherche.'
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:url', property: 'og:url', content: this.url },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ]
      // TODO add DataCatalog schema
    }
  },
  computed: {
    ...mapState(['config', 'portal', 'publicUrl', 'draft']),
    ...mapGetters(['owner']),
    url () {
      return this.publicUrl + '/reuses'
    },
    baseApplicationsItems () {
      if (!this.applications) return []
      return this.applications.facets['base-application']
    },
    topicsItems () {
      if (!this.applications) return []
      return this.applications.facets.topics
        .map(tf => ({ ...tf, filtered: !!this.filters.topics.find(t => t === tf.value.id) }))
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
    if (this.applications) this.continueFetch()
  },
  methods: {
    readQueryParams () {
      this.search = this.$route.query.q || ''
      this.sort = this.$route.query.sort ? this.$route.query.sort.split(':')[0] : 'createdAt'
      this.order = this.$route.query.sort ? (Number(this.$route.query.sort.split(':')[1]) + 1) / 2 : 0
      this.filters.apps = this.$route.query['base-application'] ? this.$route.query['base-application'].split(',') : []
      this.filters.topics = this.$route.query.topics ? this.$route.query.topics.split(',') : []
    },
    async refresh (append) {
      if (append) this.page += 1
      else this.page = 1
      const query = {}
      if (this.search) query.q = this.search
      if (this.sort !== 'createdAt' || this.order !== 0) query.sort = this.sort + ':' + (this.order * 2 - 1)
      if (this.filters.apps.length) query['base-application'] = this.filters.apps.join(',')
      if (this.filters.topics.length) query.topics = this.filters.topics.join(',')
      const params = { ...query }
      params.sort = params.sort || 'createdAt:-1'
      params.size = this.size
      params.page = this.page
      params.select = 'id,title,updatedAt,url,topics,-userPermissions'
      if (append) params.count = false
      else params.facets = 'base-application,topics'
      params.owner = this.owner
      params.publicationSites = 'data-fair-portals:' + this.portal._id
      params.html = true
      if (this.config.authentication === 'none') params.visibility = 'public'
      if (JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
        if (params.q && params.q !== this.lastParams.q && this.$ma) this.$ma.trackEvent({ action: 'search', label: this.search })
        this.lastParams = params
        this.loading = true
        if (!append) this.$router.push({ query })
        const applications = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/applications', { params })
        if (append) applications.results.forEach(r => this.applications.results.push(r))
        else this.applications = applications
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
      if (html[0].scrollHeight === html[0].clientHeight && this.applications.results.length < this.applications.count) {
        this.refresh(true)
      }
    },
    onScroll (e) {
      if (!this.applications || this.loading) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 300 && this.applications.results.length < this.applications.count) {
        this.refresh(true)
      }
    },
    toggleTopic (topic) {
      if (this.filters.topics.find(t => t === topic.id)) {
        this.filters.topics = this.filters.topics.filter(t => t !== topic.id)
      } else {
        this.filters.topics.push(topic.id)
      }
      this.refresh()
    }
  }
}
</script>

<style>
</style>
