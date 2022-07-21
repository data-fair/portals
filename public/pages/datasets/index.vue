<template>
  <div>
    <v-container
      class="py-2"
      style="position: relative"
    >
      <section-title
        v-if="datasets"
        :text="datasets.count + ' ' + (datasets.count> 1 ? 'jeux de données' : 'jeu de données')"
      >
        <template #after>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                :disabled="!!downloading"
                icon
                target="_blank"
                class="ml-2"
                @click="download(config.title+'.csv')"
                v-on="on"
              >
                <v-icon v-if="downloading !== config.title+'.csv'">
                  mdi-file-table
                </v-icon>
                <v-progress-circular
                  v-else
                  indeterminate
                  color="primary"
                />
              </v-btn>
            </template>
            <span>Exporter la sélection au format CSV</span>
          </v-tooltip>
        </template>
      </section-title>
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
            hide-details
            class="mb-2"
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
            v-model="filters.concepts"
            :loading="loading"
            :items="conceptsItems.filter(item => !!item.value)"
            :item-text="conceptLabel"
            multiple
            clearable
            outlined
            dense
            label="Filter par concepts"
            no-data-text="Aucun concept"
            hide-details
            class="mb-2"
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
            dense
            outlined
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
      <v-row v-if="datasets">
        <v-col
          v-for="(dataset, i) in datasets.results"
          :key="i"
          md="4"
          sm="6"
          cols="12"
        >
          <dataset-card :dataset="dataset" />
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
        v-if="datasets && datasets.results.length < datasets.count && !loading"
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

import fileDownload from 'js-file-download'
import DatasetCard from '~/components/dataset/card.vue'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    DatasetCard
  },
  middleware: 'portal-required',
  data: function () {
    return {
      datasets: null,
      concepts: null,
      size: 12,
      page: 1,
      search: '',
      loading: false,
      sort: '',
      order: 0,
      filters: {
        concepts: [],
        topics: [],
        id: []
      },
      sorts: [{
        text: 'Date de création',
        value: 'createdAt'
      }, {
        text: 'Date de mise à jour',
        value: 'dataUpdatedAt'
      }, {
        text: 'Ordre alphabétique',
        value: 'title'
      }],
      downloading: false,
      lastParams: {}
    }
  },
  async fetch () {
    this.readQueryParams()
    const refreshPromise = this.refresh()
    this.concepts = (await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/vocabulary')).map(c => {
      const { identifiers, ...concept } = c
      concept.id = identifiers.shift()
      return concept
    })
    await refreshPromise
  },
  head () {
    const title = 'Datasets - ' + this.config.title
    const description = 'Trouvez facilement toutes les données que nous avons publiées grâce à notre moteur de recherche.'
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
      return this.publicUrl + '/datasets'
    },
    conceptsItems () {
      if (!this.datasets) return []
      return this.datasets.facets.concepts
        .concat(this.filters.concepts.filter(c => !this.datasets.facets.concepts.find(fc => fc.value === c)).map(c => ({ value: c, count: 0 })))
    },
    topicsItems () {
      if (!this.datasets) return []
      return this.datasets.facets.topics
        .map(tf => ({ ...tf, filtered: !!this.filters.topics.find(t => t === tf.value.id) }))
    },
    defaultSort () {
      return this.config.datasetsDefaultSort || 'createdAt'
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
    if (this.datasets) this.continueFetch()
  },
  methods: {
    readQueryParams () {
      this.search = this.$route.query.q || ''
      this.sort = this.$route.query.sort ? this.$route.query.sort.split(':')[0] : this.defaultSort
      this.order = this.$route.query.sort ? (Number(this.$route.query.sort.split(':')[1]) + 1) / 2 : 0
      this.filters.concepts = this.$route.query.concepts ? this.$route.query.concepts.split(',') : []
      this.filters.topics = this.$route.query.topics ? this.$route.query.topics.split(',') : []
      this.filters.id = this.$route.query.id ? this.$route.query.id.split(',') : []
    },
    async refresh (append) {
      if (append) this.page += 1
      else this.page = 1
      const query = {}
      if (this.search) query.q = this.search
      if (this.sort !== this.defaultSort || this.order !== 0) query.sort = this.sort + ':' + (this.order * 2 - 1)
      if (this.filters.id.length) query.id = this.filters.id.join(',')
      if (this.filters.concepts.length) query.concepts = this.filters.concepts.join(',')
      if (this.filters.topics.length) query.topics = this.filters.topics.join(',')
      const params = { ...query }
      params.sort = params.sort || this.defaultSort + ':-1'
      params.size = this.size
      params.page = this.page
      params.select = 'id,title,description,dataUpdatedAt,updatedAt,extras,bbox,topics,image,isMetaOnly,-userPermissions'
      if (append) params.count = false
      else params.facets = 'concepts,topics'
      params.owner = this.owner
      params.publicationSites = 'data-fair-portals:' + this.portal._id
      params.html = true
      params.truncate = 600
      if (this.config.authentication === 'none') params.visibility = 'public'
      if (JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
        if (params.q && params.q !== this.lastParams.q && this.$ma) this.$ma.trackEvent({ action: 'search', label: this.search })
        this.lastParams = params
        this.loading = true
        if (!append) this.$router.push({ query })
        const datasets = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets', { params })
        if (append) datasets.results.forEach(r => this.datasets.results.push(r))
        else this.datasets = datasets
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
      if (html[0].scrollHeight === html[0].clientHeight && this.datasets.results.length < this.datasets.count) {
        this.refresh(true)
      }
    },
    onScroll (e) {
      if (!this.datasets || this.loading) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 300 && this.datasets.results.length < this.datasets.count) {
        this.refresh(true)
      }
    },
    conceptLabel (e) {
      const concept = this.concepts.find(c => c.id === e.value)
      return ((concept && concept.title) || e.value.split('/').pop()) + ` (${e.count})`
    },
    toggleTopic (topic) {
      if (this.filters.topics.find(t => t === topic.id)) {
        this.filters.topics = this.filters.topics.filter(t => t !== topic.id)
      } else {
        this.filters.topics.push(topic.id)
      }
      this.refresh()
    },
    async download (name) {
      this.downloading = name
      const params = {
        size: 10000,
        select: 'id,title,description,bbox,topics,href,dataUpdatedAt,createdAt,-userPermissions',
        publicationSites: 'data-fair-portals:' + this.$store.state.portal._id,
        owner: this.owner,
        sort: this.sort + ':' + (this.order * 2 - 1),
        q: this.search
      }
      if (this.filters.concepts.length) params.concepts = this.filters.concepts.join(',')
      if (this.filters.topics.length) params.topics = this.filters.topics.join(',')
      if (this.config.authentication === 'none') params.visibility = 'public'
      try {
        const datasets = (await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets', { params })).results
        const header = 'identifiant,titre,description,themes,couverture spatiale,page,api,date de création,date de mise a jour'
        const content = datasets.map(d => `${d.id},"${d.title}","${d.description}","${(d.topics || []).map(t => t.title).join(';')}",${d.bbox ? ('"' + JSON.stringify(d.bbox) + '"') : ''},${this.url + '/' + d.id},${d.href},${d.dataUpdatedAt},${d.createdAt}`).join('\n')
        const blob = new Blob([header + '\n' + content], { type: 'text/csv' })
        fileDownload(blob, name)
      } catch (err) { }
      this.downloading = null
    }
  }
}

</script>

<style>
</style>
