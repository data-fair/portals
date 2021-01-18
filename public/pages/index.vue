<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="5"
        offset-md="1"
      >
        <v-img
          :src="homeUrl"
          :alt="config.title"
          min-height="200"
          max-height="600"
          contain
        />
      </v-col>
      <v-col
        class="pt-2 order-sm-first"
        cols="12"
        md="6"
      >
        <div v-if="config.description" v-html="marked(config.description).html" />
      </v-col>
    </v-row>
    <kpi
      v-if="config.showKpis"
      class="mt-4"
      :stats="stats"
    />
    <div v-if="config.featuredReuse && config.featuredReuse.id" class="mt-4">
      <nuxt-link
        :to="`/reuses/${config.featuredReuse.id}`"
        class="title"
        style="text-decoration-line:none"
      >
        {{ config.featuredReuse.title }}&nbsp;<v-icon :color="'primary'">
          mdi-open-in-new
        </v-icon>
      </nuxt-link>
      <client-only>
        <iframe
          v-if="featuredBaseApplication && featuredBaseApplication.applicationName === 'Liste et fiches'"
          id="featured-reuse-frame"
          :src="dataFairUrl + '/app/' + config.featuredReuse.id + '?embed=true'"
          height="100%"
          width="100%"
          @load="iframeLoaded"
        />
        <v-responsive v-else :aspect-ratio="$vuetify.breakpoint.smAndUp ? 1.5 : 1.0">
          <div style="width:1px;min-width:100%;height:1px;min-height:100%;">
            <iframe
              :src="dataFairUrl + '/app/' + config.featuredReuse.id + '?embed=true'"
              height="100%"
              width="100%"
            />
          </div>
        </v-responsive>
      </client-only>
    </div>
    <div v-if="config.homeDatasets && config.homeDatasets.type === 'lasts'">
      <h3 class="headline grey--text text--darken-2 font-weight-bold mb-3">
        Derniers jeux de données
      </h3>
      <v-container
        v-if="datasets"
        class="px-0"
        fluid
      >
        <v-row>
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
                    <h3 class="title grey--text text--darken-2 font-weight-bold" style="height:40px;line-height:1.1;">
                      <client-only>
                        <v-clamp :max-lines="2" autoresize>
                          {{ dataset.title }}
                        </v-clamp>
                      </client-only>
                    </h3>
                  </v-card-title>
                  <v-card-text style="height:200px;color: rgba(0,0,0,0.87)" class="py-0">
                    <client-only>
                      <v-clamp
                        :max-height="200"
                        autoresize
                        class="dataset-desc200"
                        v-html="marked(dataset.description || '').html"
                      />
                    </client-only>
                  </v-card-text>
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
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
      <v-row align="center">
        <v-col class="text-center">
          <v-btn
            :color="'primary'"
            to="/datasets"
            text
            exact
          >
            <v-icon>mdi-open-in-new</v-icon>&nbsp;Toutes les données
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <div v-if="config.homeReuses && config.homeReuses.type === 'lasts' && applications && applications.results.length">
      <h3 class="headline grey--text text--darken-2 font-weight-bold mb-2">
        Dernières valorisations
      </h3>
      <v-container
        class="pa-0"
        fluid
      >
        <v-row>
          <v-col
            v-for="(application, i) in applications.results"
            :key="i"
            cols="12"
          >
            <v-hover>
              <v-card
                slot-scope="{ hover }"
                outlined
                :elevation="hover ? 2 : 0"
              >
                <nuxt-link :to="`/reuses/${application.id}`" style="text-decoration:none">
                  <v-card-title class="py-2">
                    <h3 class="title grey--text text--darken-2 font-weight-bold">
                      <client-only>
                        <v-clamp :max-lines="1" autoresize>
                          {{ application.title }}
                        </v-clamp>
                      </client-only>
                    </h3>
                  </v-card-title>
                  <div>
                    <v-img
                      :src="`${application.href}/capture`"
                      :alt="application.title"
                      aspect-ratio="4"
                    />
                  </div>
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
                  <v-subheader>
                    Mis à jour le {{ application.updatedAt | moment("DD/MM/YYYY") }}
                  </v-subheader>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
      <v-row align="center">
        <v-col class="text-center">
          <v-btn
            :color="'primary'"
            to="/reuses"
            text
            exact
          >
            <v-icon>mdi-open-in-new</v-icon>&nbsp;Toutes les visualisations
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
  import VClamp from 'vue-clamp'
  import Kpi from '~/components/kpi.vue'
  import ApplicationView from '~/components/application/application-view.vue'
  import TablePreview from '~/components/dataset/table-preview.vue'
  import MapPreview from '~/components/dataset/map-preview.vue'
  import ApiView from '~/components/dataset/api-view.vue'
  import SchemaView from '~/components/dataset/schema-view.vue'
  import { isMobileOnly } from 'mobile-device-detect'
  import iFrameResize from 'iframe-resizer/js/iframeResizer'
  const { mapState } = require('vuex')
  const marked = require('@hackmd/meta-marked')

  export default {
    middleware: 'portal-required',
    components: {
      VClamp,
      Kpi,
      ApplicationView,
      TablePreview,
      MapPreview,
      ApiView,
      SchemaView,
    },
    async fetch () {
      const promiseApplications = this.$axios.$get(process.env.dataFairUrl + '/api/v1/applications', {
        params: {
          size: (this.config.homeDatasets && this.config.homeDatasets.size) || 3,
          select: 'id,title,updatedAt,createdAt,createdBy',
          owner: this.$store.getters.owner,
          sort: 'createdAt:-1',
          visibility: this.config.public ? 'public' : '',
        },
        withCredentials: true,
      })
      const promiseDatasets = this.$axios.$get(process.env.dataFairUrl + '/api/v1/datasets', {
        params: {
          size: (this.config.homeReuses && this.config.homeReuses.size) || 3,
          select: 'id,title,description,updatedAt,createdAt,createdBy,extras,bbox',
          owner: this.$store.getters.owner,
          sort: 'createdAt:-1',
          visibility: this.config.public ? 'public' : '',
        },
        withCredentials: true,
      })

      // TODO: replace by a proper public stats route
      const promiseStatsDatasets = await this.$axios.$get(process.env.dataFairUrl + '/api/v1/datasets', {
        params: {
          size: 1000,
          select: 'count',
          owner: this.$store.getters.owner,
          visibility: this.config.public ? 'public' : '',
        },
        withCredentials: true,
      })
      this.applications = await promiseApplications
      this.datasets = await promiseDatasets
      const statsDatasets = await promiseStatsDatasets
      this.stats = {
        reuses: {
          count: this.applications.count,
        },
        datasets: {
          count: statsDatasets.count,
          numlines: statsDatasets.results.reduce((result, { count }) => result + (count || 0), 0),
        },
      }
    },
    data: () => ({
      applications: null,
      datasets: null,
      stats: null,
      featuredBaseApplication: null,
      isMobileOnly,
    }),
    computed: {
      ...mapState(['config', 'publicUrl', 'portal']),
      homeUrl() {
        return `${process.env.publicUrl}/api/v1/portals/${this.portal._id}/assets/home?draft=${this.$store.state.draft}`
      },
      dataFairUrl() {
        return process.env.dataFairUrl
      },
    },
    watch: {
      async application() {
        if (this.config.featuredReuse && this.config.featuredReuse.id) this.featuredBaseApplication = await this.$axios.$get(process.env.dataFairUrl + `/api/v1/applications/${this.config.featuredReuse.id}/base-application`, { withCredentials: true })
      },
    },
    async mounted() {
      if (this.config.featuredReuse && this.config.featuredReuse.id) this.featuredBaseApplication = await this.$axios.$get(process.env.dataFairUrl + `/api/v1/applications/${this.config.featuredReuse.id}/base-application`, { withCredentials: true })
    },
    methods: {
      marked,
      iframeLoaded () {
        iFrameResize({ log: false }, '#featured-reuse-frame')
      },
    },
    head () {
      const title = this.config.title
      const description = 'Accédez facilement à nos données et découvrez les au travers de visualisations interactives.'
      return {
        title,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:url', property: 'og:url', content: process.env.publicUrl },
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
.dataset-desc200:before {
  content:'';
  width:100%;
  height:72px;
  position:absolute;
  left:0;
  top:200px;
  background:linear-gradient(transparent 0, white);
}
</style>
