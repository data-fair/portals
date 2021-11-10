<template>
  <div>
    <v-container class="py-2">
      <section-title v-if="applications" :text="applications.count + ' visualisations'" />
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
          <v-row align="center">
            <v-col class="pr-1">
              <v-select
                v-model="sort"
                :items="sorts"
                label="Trier par"
                @input="refresh()"
              />
            </v-col>
            <v-col class="pl-0">
              <v-btn-toggle
                v-model="order"
                mandatory
                dense
                @change="refresh()"
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
          class="ml-3 my-1"
          @click="toggleTopic(topicItem.value)"
        >
          {{ topicItem.value.title }} ({{ topicItem.count }})
        </v-chip>
      </v-row>
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
          <div v-else style="height: 40px;" />
        </v-col>
      </v-row>
      <v-row
        v-if="applications && applications.results.length < applications.count"
        class="pt-5 pb-0"
        align="center"
      >
        <v-col class="text-center pa-0">
          <v-btn text @click="refresh(true)">
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
    middleware: 'portal-required',
    components: {
      ApplicationCard,
    },
    async fetch() {
      await this.refresh()
    },
    data: function() {
      return {
        applications: null,
        size: 12,
        page: 1,
        search: this.$route.query.q || '',
        loading: false,
        sort: this.$route.query.sort ? this.$route.query.sort.split(':')[0] : 'createdAt',
        order: this.$route.query.sort ? (Number(this.$route.query.sort.split(':')[1]) + 1) / 2 : 0,
        filters: {
          apps: this.$route.query['base-application'] ? this.$route.query['base-application'].split(',') : [],
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
        lastParams: null,
      }
    },
    computed: {
      ...mapState(['config', 'portal', 'publicUrl']),
      ...mapGetters(['owner']),
      url() {
        return this.publicUrl + '/reuses'
      },
      baseApplicationsItems() {
        if (!this.applications) return []
        return this.applications.facets['base-application']
      },
      topicsItems() {
        if (!this.applications) return []
        return this.applications.facets.topics
          .map(tf => ({ ...tf, filtered: !!this.filters.topics.find(t => t === tf.value.id) }))
      },
    },
    mounted() {
      // case where SSR already fetched the first page
      if (this.applications) this.continueFetch()
    },
    methods: {
      async refresh(append) {
        if (append) this.page += 1
        else this.page = 1
        const query = {
          sort: this.sort + ':' + (this.order * 2 - 1),
          q: this.search,
        }
        if (this.filters.apps.length) query['base-application'] = this.filters.apps.join(',')
        if (this.filters.topics.length) query.topics = this.filters.topics.join(',')
        const params = Object.assign({}, query)
        params.size = this.size
        params.page = this.page
        params.select = 'id,title,description,updatedAt,url,updatedBy,topics'
        params.facets = 'base-application,topics'
        params.owner = this.owner
        params.publicationSites = 'data-fair-portals:' + this.portal._id
        if (this.config.authentication === 'none') params.visibility = 'public'
        if (JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
          if (this.search) {
            const trackEvent = { action: 'search', label: this.search }
            if (this.$ma) this.$ma.trackEvent(trackEvent)
            else console.log('No analytics, search reuses track event', trackEvent)
          }
          this.lastParams = params
          this.loading = true
          this.$router.push({ query })
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
      continueFetch() {
        const html = document.getElementsByTagName('html')
        if (html[0].scrollHeight === html[0].clientHeight && this.applications.results.length < this.applications.count) {
          this.refresh(true)
        }
      },
      onScroll(e) {
        if (!this.applications) return
        const se = e.target.scrollingElement
        if (se.clientHeight + se.scrollTop > se.scrollHeight - 140 && this.applications.results.length < this.applications.count) {
          this.refresh(true)
        }
      },
      toggleTopic(topic) {
        if (this.filters.topics.find(t => t === topic.id)) {
          this.filters.topics = this.filters.topics.filter(t => t !== topic.id)
        } else {
          this.filters.topics.push(topic.id)
        }
        this.refresh()
      },
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
          { hid: 'og:type', property: 'og:type', content: 'website' },
        ],
      // TODO add DataCatalog schema
      }
    },
  }
</script>
