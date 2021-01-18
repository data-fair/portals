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
            <v-col class="pl-0">
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
          <v-hover>
            <v-card
              slot-scope="{ hover }"
              outlined
              :elevation="hover ? 2 : 0"
            >
              <nuxt-link :to="`/datasets/${dataset.id}`" style="text-decoration:none">
                <v-card-title>
                  <h3 class="title grey--text text--darken-2 font-weight-bold" style="height:40px;line-height: 1.1;">
                    <client-only>
                      <v-clamp :max-lines="2" autoresize>
                        {{ dataset.title }}
                      </v-clamp>
                    </client-only>
                  </h3>
                </v-card-title>
                <v-card-text style="height:170px;color: rgba(0,0,0,0.87)" class="py-0">
                  <client-only>
                    <v-clamp
                      :max-height="170"
                      class="dataset-desc170"
                      autoresize
                      v-html="marked(dataset.description || '').html"
                    />
                  </client-only>
                </v-card-text>
                <v-row style="min-height:25px;">
                  <v-col class="py-0">
                    <v-chip
                      v-for="topic of dataset.topics"
                      :key="topic.id"
                      small
                      outlined
                      :color="topic.color || 'default'"
                      class="ml-2"
                      style="font-weight: bold"
                    >
                      {{ topic.title }}
                    </v-chip>
                  </v-col>
                </v-row>
              </nuxt-link>
              <v-card-actions class="py-0">
                <table-preview :dataset="dataset" :color="'primary'" />
                <map-preview
                  v-if="dataset.bbox && dataset.bbox.length"
                  :dataset="dataset"
                  :color="'primary'"
                />
                <api-view
                  v-if="!isMobileOnly"
                  :dataset="dataset"
                  :color="'primary'"
                />
                <schema-view :dataset="dataset" :color="'primary'" />
                <v-spacer />
                <v-subheader>Mis à jour le {{ dataset.updatedAt | moment("DD/MM/YYYY") }}</v-subheader>
                <!-- <v-layout column>
                    <span>Mis à jour le {{ dataset.meta.updated }}</span>
                    <span>{{ dataset.meta.author }}</span>
                  </v-layout> -->
                <!-- <v-btn :to="dataset.href" color="warning" flat exact>Lire la suite</v-btn> -->
              </v-card-actions>
            </v-card>
          </v-hover>
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
  import VClamp from 'vue-clamp'
  import TablePreview from '~/components/dataset/table-preview.vue'
  import MapPreview from '~/components/dataset/map-preview.vue'
  import ApiView from '~/components/dataset/api-view.vue'
  import SchemaView from '~/components/dataset/schema-view.vue'
  import { isMobileOnly } from 'mobile-device-detect'
  const { mapState, mapGetters } = require('vuex')
  const marked = require('@hackmd/meta-marked')

  export default {
    middleware: 'portal-required',
    components: {
      VClamp,
      TablePreview,
      MapPreview,
      ApiView,
      SchemaView,
    },
    async fetch() {
      this.concepts = (await this.$axios.$get(process.env.dataFairUrl + '/api/v1/vocabulary', { withCredentials: true })).map(c => {
        const { identifiers, ...concept } = c
        concept.id = identifiers.shift()
        return concept
      })
      await this.refresh(true)
    },
    data: () => ({
      datasets: null,
      concepts: null,
      size: 12,
      page: 1,
      search: null,
      loading: false,
      sort: 'updatedAt',
      order: 0,
      filters: {
        concepts: [],
        topics: [],
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
      isMobileOnly,
    }),
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
          .map(tf => ({ ...tf, filtered: !!this.filters.topics.find(t => t.id === tf.value.id) }))
          .concat(this.filters.topics.filter(c => !this.datasets.facets.topics.find(fc => fc.value.id === c.id)).map(c => ({ value: c, count: 0, filtered: true })))
      },
    },
    methods: {
      async refresh(reset) {
        this.loading = true
        if (reset) this.page = 1
        const params = {
          size: this.size,
          page: this.page,
          select: 'id,title,description,updatedAt,updatedBy,extras,bbox,topics',
          owner: this.owner,
          sort: this.sort + ':' + (this.order * 2 - 1),
          facets: 'concepts,topics',
          q: this.search,
        }
        if (this.filters.concepts.length) params.concepts = this.filters.concepts.join(',')
        if (this.filters.topics.length) params.topics = this.filters.topics.map(t => t.id).join(',')
        if (this.config.public) params.visibility = 'public'
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
      marked,
      toggleTopic(topic) {
        if (this.filters.topics.find(t => t.id === topic.id)) {
          this.filters.topics = this.filters.topics.filter(t => t.id !== topic.id)
        } else {
          this.filters.topics.push(topic)
        }
        this.refresh(true)
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

<style>
.dataset-desc170:before {
  content:'';
  width:100%;
  height:62px;
  position:absolute;
  left:0;
  top:180px;
  background:linear-gradient(transparent 0, white);
}
</style>
