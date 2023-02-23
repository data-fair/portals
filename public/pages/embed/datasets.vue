<template lang="html">
  <v-container
    v-scroll="onScroll"
    data-iframe-height
  >
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          autofocus
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
      <v-col>
        <v-select
          v-model="sort"
          dense
          outlined
          :items="sorts"
          label="Trier par"
          hide-details
          class="select-sort mb-2"
          :menu-props="{offsetY: true}"
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
              <v-btn
                text
                :height="40"
                aria-label="Décroissant"
                title="Décroissant"
              >
                <v-icon>mdi-sort-descending</v-icon>
              </v-btn>
              <v-btn
                text
                :height="40"
                aria-label="Croissant"
                title="Croissant"
              >
                <v-icon>mdi-sort-ascending</v-icon>
              </v-btn>
            </v-btn-toggle>
          </template>
        </v-select>
      </v-col>
    </v-row>
    <v-row v-if="datasets">
      <v-col
        v-for="(dataset, i) in datasets.results"
        :key="i"
        :cols="12"
        :md="6"
      >
        <dataset-embed-card
          :dataset="dataset"
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
</template>

<script>
import 'iframe-resizer/js/iframeResizer.contentWindow'
import { mapState, mapGetters } from 'vuex'

global.iFrameResizer = {
  heightCalculationMethod: 'taggedElement'
}

export default {
  layout: 'minimal',
  data: () => ({
    datasets: null,
    size: 12,
    page: 1,
    search: '',
    loading: false,
    sort: '',
    order: 0,
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
    lastParams: {}
  }),
  computed: {
    ...mapState(['config', 'portal']),
    ...mapGetters(['owner', 'dataFairUrl'])
  },
  mounted () {
    this.sort = this.config.datasetsDefaultSort || 'createdAt'
    // case where SSR already fetched the first page
    this.refresh()
  },
  methods: {
    async refresh (append) {
      if (append) this.page += 1
      else this.page = 1
      const params = {
        sort: this.sort + ':' + (this.order * 2 - 1),
        size: this.size,
        page: this.page,
        owner: this.owner,
        publicationSites: 'data-fair-portals:' + this.portal._id,
        html: true,
        truncate: 600
        // visibility: 'public'
      }
      if (this.search) params.q = this.search
      if (append) params.count = false
      if (JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
        if (params.q && params.q !== this.lastParams.q && this.$ma) this.$ma.trackEvent({ action: 'search', label: this.search })
        this.lastParams = params
        this.loading = true
        const datasets = await this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', { params })
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
      if (html[0].clientHeight >= (html[0].scrollHeight - 300) && this.datasets.results.length < this.datasets.count) {
        this.refresh(true)
      }
    },
    onScroll (e) {
      if (!this.datasets || this.loading) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 300 && this.datasets.results.length < this.datasets.count) {
        this.refresh(true)
      }
    }
  }
}
</script>

<style lang="css">
</style>
