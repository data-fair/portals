<template>
  <div>
    <v-container class="py-2">
      <section-title
        v-if="uses"
        :text="uses.count + ' ' + (uses.count> 1 ? 'réutilisations' : 'réutilisation')"
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
    </v-container>
    <v-container v-scroll="onScroll">
      <v-row v-if="uses">
        <v-col
          v-for="(use, i) in uses.results"
          :key="i"
          xl="3"
          md="4"
          sm="6"
          cols="12"
        >
          <use-card :use="use" />
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
        v-if="uses && uses.results.length < uses.count && !loading"
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
import useCard from '~/components/use/card.vue'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    useCard
  },
  middleware: 'portal-required',
  data: function () {
    return {
      uses: null,
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
        value: 'created.date'
      }, {
        text: 'Date de mise à jour',
        value: 'updated.date'
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
    const title = 'Réutilisations - ' + this.config.title
    const description = 'Découvrez les réutilisations de données réalisées par nos utilisateurs grâce à notre moteur de recherche.'
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
      return this.publicUrl + '/uses'
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
    if (this.uses) this.continueFetch()
  },
  methods: {
    readQueryParams () {
      this.search = this.$route.query.q || ''
      this.sort = this.$route.query.sort ? this.$route.query.sort.split(':')[0] : 'createdAt'
      this.order = this.$route.query.sort ? (Number(this.$route.query.sort.split(':')[1]) + 1) / 2 : 0
    },
    async refresh (append) {
      if (append) this.page += 1
      else this.page = 1
      const query = {}
      if (this.search) query.q = this.search
      if (this.sort !== 'createdAt' || this.order !== 0) query.sort = this.sort + ':' + (this.order * 2 - 1)
      const params = { ...query }
      params.sort = params.sort || 'created.date:-1'
      params.size = this.size
      params.page = this.page
      params.select = 'id,title,updated.date'
      if (append) params.count = false
      params.html = true
      if (JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
        if (params.q && params.q !== this.lastParams.q && this.$ma) this.$ma.trackEvent({ action: 'search', label: this.search })
        this.lastParams = params
        this.loading = true
        if (!append) this.$router.push({ query })
        const uses = await this.$axios.$get(`/api/v1/portals/${this.portal._id}/uses`, { params })
        if (append) uses.results.forEach(r => this.uses.results.push(r))
        else this.uses = uses
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
      if (html[0].scrollHeight === html[0].clientHeight && this.uses.results.length < this.uses.count) {
        this.refresh(true)
      }
    },
    onScroll (e) {
      if (!this.uses || this.loading) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 300 && this.uses.results.length < this.uses.count) {
        this.refresh(true)
      }
    }
  }
}
</script>

<style>
</style>
