<template>
  <div>
    <v-container class="py-2">
      <section-title v-if="datasets" :text="datasets.count + ' jeux de données'" />
      <section-title v-else text="..." />
      <v-row align="center">
        <v-col
          class="py-0"
          cols="12"
          sm="6"
          md="4"
        >
          <v-text-field
            v-model="search"
            label="Rechercher"
            append-icon="mdi-magnify"
            @keyup.enter.native="refresh(true)"
            @click:append="refresh(true)"
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
            :items="conceptsItems"
            :item-text="conceptLabel"
            multiple
            clearable
            label="Filter par concepts"
            no-data-text="Aucun concept"
            @input="refresh(true)"
          />
        </v-col>
        <v-col
          class="py-0"
          cols="12"
          sm="6"
          md="4"
        >
          <v-row align="center">
            <v-col class="pr-1">
              <v-select
                v-model="sort"
                :items="sorts"
                label="Trier par"
                @input="refresh(true)"
              />
            </v-col>
            <v-col class="pl-0" :cols="4">
              <v-btn-toggle
                v-model="order"
                mandatory
                dense
                @change="refresh(true)"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      text
                      small
                      v-on="on"
                    >
                      <v-icon>mdi-sort-descending</v-icon>
                    </v-btn>
                  </template>
                  <span>Décroissant</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      text
                      small
                      v-on="on"
                    >
                      <v-icon>mdi-sort-ascending</v-icon>
                    </v-btn>
                  </template>
                  <span>Croissant</span>
                </v-tooltip>
              </v-btn-toggle>
            </v-col>
            <v-col :cols="2">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    :disabled="!!downloading"
                    icon
                    target="_blank"
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
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="topicsItems.length">
        <v-chip
          v-for="topicItem in topicsItems"
          :key="topicItem.value.id"
          :color="topicItem.value.color"
          :outlined="!topicItem.filtered"
          :dark="topicItem.filtered"
          class="ml-3"
          @click="toggleTopic(topicItem.value)"
        >
          {{ topicItem.value.title }} ({{ topicItem.count }})
        </v-chip>
      </v-row>
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
          <div v-else style="height: 40px;" />
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
    middleware: 'portal-required',
    components: {
      DatasetCard,
    },
    async fetch() {
      this.concepts = (await this.$axios.$get(process.env.dataFairUrl + '/api/v1/vocabulary', { withCredentials: true })).map(c => {
        const { identifiers, ...concept } = c
        concept.id = identifiers.shift()
        return concept
      })
      await this.refresh(true)
    },
    data: function() {
      return {
        datasets: null,
        concepts: null,
        size: 12,
        page: 1,
        search: this.$route.query.q || '',
        loading: false,
        sort: this.$route.query.sort ? this.$route.query.sort.split(':')[0] : 'createdAt',
        order: this.$route.query.sort ? (Number(this.$route.query.sort.split(':')[1]) + 1) / 2 : 0,
        filters: {
          concepts: this.$route.query.concepts ? this.$route.query.concepts.split(',') : [],
          topics: this.$route.query.topics ? this.$route.query.topics.split(',') : [],
        },
        sorts: [{
          text: 'Date de mise à jour',
          value: 'updatedAt',
        }, {
          text: 'Date de création',
          value: 'createdAt',
        }, {
          text: 'Ordre alphabétique',
          value: 'title',
        }],
        downloading: false,
      }
    },
    computed: {
      ...mapState(['config']),
      ...mapGetters(['owner']),
      url() {
        return process.env.publicUrl + '/datasets'
      },
      conceptsItems() {
        if (!this.datasets) return []
        return this.datasets.facets.concepts
          .concat(this.filters.concepts.filter(c => !this.datasets.facets.concepts.find(fc => fc.value === c)).map(c => ({ value: c, count: 0 })))
      },
      topicsItems() {
        if (!this.datasets) return []
        return this.datasets.facets.topics
          .map(tf => ({ ...tf, filtered: !!this.filters.topics.find(t => t === tf.value.id) }))
      },
    },
    methods: {
      async refresh(reset) {
        this.loading = true
        if (reset) this.page = 1
        const query = {
          sort: this.sort + ':' + (this.order * 2 - 1),
          q: this.search,
        }
        if (this.filters.concepts.length) query.concepts = this.filters.concepts.join(',')
        if (this.filters.topics.length) query.topics = this.filters.topics.join(',')
        const params = Object.assign({}, query)
        params.size = this.size
        params.page = this.page
        params.select = 'id,title,description,updatedAt,updatedBy,extras,bbox,topics'
        params.facets = 'concepts,topics'
        params.owner = this.owner
        if (this.config.authentication === 'none') params.visibility = 'public'
        this.$router.push({ query })
        const datasets = await this.$axios.$get(process.env.dataFairUrl + '/api/v1/datasets', { params, withCredentials: true })
        if (reset) this.datasets = datasets
        else datasets.results.forEach(r => this.datasets.results.push(r))
        this.loading = false
      },
      onScroll(e) {
        if (!this.datasets) return
        const se = e.target.scrollingElement
        if (se.clientHeight + se.scrollTop > se.scrollHeight - 140 && this.datasets.results.length < this.datasets.count) {
          this.page += 1
          this.refresh()
        }
      },
      conceptLabel(e) {
        const concept = this.concepts.find(c => c.id === e.value)
        return ((concept && concept.title) || e.value.split('/').pop()) + ` (${e.count})`
      },
      toggleTopic(topic) {
        if (this.filters.topics.find(t => t === topic.id)) {
          this.filters.topics = this.filters.topics.filter(t => t !== topic.id)
        } else {
          this.filters.topics.push(topic.id)
        }
        this.refresh(true)
      },
      async download(name) {
        this.downloading = name
        const params = {
          size: 10000,
          select: 'id,title,description,bbox,topics,href,updatedAt,createdAt',
          owner: this.owner,
          sort: this.sort + ':' + (this.order * 2 - 1),
          q: this.search,
        }
        if (this.filters.concepts.length) params.concepts = this.filters.concepts.join(',')
        if (this.filters.topics.length) params.topics = this.filters.topics.join(',')
        if (this.config.authentication === 'none') params.visibility = 'public'
        try {
          const datasets = (await this.$axios.$get(process.env.dataFairUrl + '/api/v1/datasets', { params, withCredentials: true })).results
          const header = 'identifiant,titre,description,themes,couverture spatiale,page,api,date de création,date de mise a jour'
          const content = datasets.map(d => `${d.id},"${d.title}","${d.description}","${(d.topics || []).map(t => t.title).join(';')}",${d.bbox ? ('"' + JSON.stringify(d.bbox) + '"') : ''},${this.url + '/' + d.id},${d.href},${d.updatedAt},${d.createdAt}`).join('\n')
          const blob = new Blob([header + '\n' + content], { type: 'text/csv' })
          fileDownload(blob, name)
        } catch (err) { }
        this.downloading = null
      },
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
          { hid: 'og:type', property: 'og:type', content: 'website' },
        ],
      // TODO add DataCatalog schema
      }
    },
  }

</script>
