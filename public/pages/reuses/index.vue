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
            v-model="filters.apps"
            :loading="loading"
            :items="baseApplicationsItems"
            item-text="value.title"
            item-value="value.url"
            multiple
            return-object
            clearable
            label="Filtrer par application"
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
      <v-row v-if="applications">
        <v-col
          v-for="(application, i) in applications.results"
          :key="i"
          xl="3"
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
              <nuxt-link :to="{name: 'reuses-id', params:{id: application.id}}" style="text-decoration:none">
                <v-card-title>
                  <h3 class="title grey--text text--darken-2 font-weight-bold" style="height:40px;line-height: 1.1">
                    <v-clamp :max-lines="2" autoresize>
                      {{ application.title }}
                    </v-clamp>
                  </h3>
                </v-card-title>
                <div class="pb-2">
                  <v-img
                    :src="`${application.href}/capture`"
                    :alt="application.title"
                    aspect-ratio="3"
                  />
                </div>
                <v-row style="min-height:25px;">
                  <v-col class="py-0">
                    <v-chip
                      v-for="topic of application.topics"
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
                <application-view :application="application" />
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :to="{name: 'reuses-id-full', params:{id: application.id}}"
                      icon
                      v-on="on"
                    >
                      <v-icon color="primary">
                        mdi-fullscreen
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Accéder à la visualisation en plein écran</span>
                </v-tooltip>
                <v-spacer />
                <v-subheader>Mis à jour le {{ application.updatedAt | moment("DD/MM/YYYY") }}</v-subheader>
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
  import ApplicationView from '~/components/application/application-view.vue'
  const { mapState, mapGetters } = require('vuex')
  const marked = require('@hackmd/meta-marked')

  export default {
    middleware: 'portal-required',
    components: {
      VClamp,
      ApplicationView,
    },
    async fetch() {
      await this.refresh(true)
    },
    data: () => ({
      applications: null,
      size: 12,
      page: 1,
      search: null,
      loading: false,
      sort: 'createdAt',
      order: 0,
      filters: {
        apps: [],
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
    }),
    computed: {
      ...mapState(['config']),
      ...mapGetters(['owner']),
      url() {
        return process.env.publicUrl + '/reuses'
      },
      baseApplicationsItems() {
        if (!this.applications) return []
        return this.applications.facets['base-application']
          .concat(this.filters.apps.filter(c => !this.applications.facets['base-application'].find(fc => fc.value.url === c.value.url)).map(c => ({ value: c.value, count: 0 })))
      },
      topicsItems() {
        if (!this.applications) return []
        return this.applications.facets.topics
          .map(tf => ({ ...tf, filtered: !!this.filters.topics.find(t => t.id === tf.value.id) }))
          .concat(this.filters.topics.filter(c => !this.applications.facets.topics.find(fc => fc.value.id === c.id)).map(c => ({ value: c, count: 0, filtered: true })))
      },
    },
    methods: {
      async refresh(reset) {
        this.loading = true
        if (reset) this.page = 1
        const params = {
          size: this.size,
          page: this.page,
          select: 'id,title,description,updatedAt,url,updatedBy,topics',
          owner: this.owner,
          sort: this.sort + ':' + (this.order * 2 - 1),
          q: this.search,
          facets: 'base-application,topics',
        }
        if (this.filters.apps.length) params['base-application'] = this.filters.apps.map(t => t.value.url).join(',')
        if (this.filters.topics.length) params.topics = this.filters.topics.map(t => t.id).join(',')
        if (this.config.public) params.visibility = 'public'
        const applications = await this.$axios.$get(process.env.dataFairUrl + '/api/v1/applications', { params, withCredentials: true })
        if (reset) this.applications = applications
        else applications.results.forEach(r => this.applications.results.push(r))
        this.loading = false
      },
      onScroll(e) {
        if (!this.applications) return
        const se = e.target.scrollingElement
        if (se.clientHeight + se.scrollTop > se.scrollHeight - 140 && this.applications.results.length < this.applications.count) {
          this.page += 1
          this.refresh()
        }
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
