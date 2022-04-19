<template>
  <div>
    <template v-if="config.homeImageAsBanner">
      <client-only v-if="config.homeReuse">
        <v-iframe
          :src="homeReuseUrl"
          class="elevation-4"
          style="margin-top: -12px;height: 400px;"
        />
      </client-only>
      <v-img
        v-else
        :src="homeUrl"
        :alt="config.title"
        max-height="400px"
        class="elevation-4"
        style="margin-top: -12px;"
      />
    </template>
    <v-container>
      <v-row v-if="!config.homeImageAsBanner">
        <v-col
          cols="12"
          md="5"
          offset-md="1"
        >
          <client-only v-if="config.homeReuse">
            <v-iframe
              :src="homeReuseUrl"
              style="height: 600px;"
            />
          </client-only>
          <v-img
            v-else
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
          <div
            v-if="config.description"
            v-html="config.description"
          />
        </v-col>
      </v-row>
      <div
        v-else-if="config.description"
        v-html="config.description"
      />
      <kpi
        v-if="config.showKpis"
        class="mt-4"
        :stats="stats"
      />
      <v-row
        v-if="config.showSearch"
        justify="center"
        class="py-4"
      >
        <v-text-field
          v-model="search"
          :autofocus="!draft"
          rounded
          style="max-width:400px;"
          placeholder="Rechercher"
          outlined
          append-icon="mdi-magnify"
          hide-details
          class="mb-2 v-input--is-focused primary--text"
          @keyup.enter.native="$router.push({name: 'datasets', query: {q: search}})"
          @click:append="$router.push({name: 'datasets', query: {q: search}})"
        />
      </v-row>
      <topics
        v-if="config.showTopics"
        :topics="topics"
      />

      <!-- reuses: featured and lasts -->
      <v-row v-if="config.twitter">
        <v-col
          cols="12"
          md="8"
          sm="6"
          align-self="stretch"
        >
          <template v-if="config.featuredReuse && config.featuredReuse.id">
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
              <v-iframe
                :src="featuredReuseUrl"
                style="height:90%"
              />
            </client-only>
          </template>
          <template v-else>
            <last-apps
              v-if="showLastApps"
              :applications="applications"
              small
            />
            <last-datasets
              v-if="showLastDatasets"
              :datasets="datasets"
              small
            />
          </template>
        </v-col>

        <v-col
          cols="12"
          md="4"
          sm="6"
        >
          <timeline
            :id="config.twitter"
            :source-type="'profile'"
            :options="{ tweetLimit }"
            class="elevation-3"
          />
        </v-col>
      </v-row>
      <v-row v-else-if="config.featuredReuse && config.featuredReuse.id">
        <v-col
          md="10"
          offset-md="1"
          cols="12"
          class="my-3 grow"
        >
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
            <v-iframe :src="featuredReuseUrl" />
          </client-only>
        </v-col>
      </v-row>
      <template v-if="!config.twitter || (config.featuredReuse && config.featuredReuse.id)">
        <last-apps
          v-if="showLastApps"
          :applications="applications"
        />
        <last-datasets
          v-if="showLastDatasets"
          :datasets="datasets"
        />
      </template>
    </v-container>
  </div>
</template>

<script>
import LastDatasets from '~/components/last-datasets.vue'
import LastApps from '~/components/last-apps.vue'
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
import Timeline from 'vue-tweet-embed/dist/timeline'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    LastDatasets,
    LastApps,
    VIframe,
    Timeline
  },
  middleware: 'portal-required',
  data: () => ({
    applications: null,
    datasets: null,
    stats: null,
    topics: [],
    search: ''
  }),
  async fetch () {
    const promiseApplications = this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/applications', {
      params: {
        size: (this.config.homeDatasets && this.config.homeDatasets.size) || 3,
        select: 'id,title,updatedAt,createdAt,createdBy',
        owner: this.$store.getters.owner,
        publicationSites: 'data-fair-portals:' + this.$store.state.portal._id,
        sort: 'createdAt:-1',
        visibility: this.config.authentication === 'none' ? 'public' : '',
        html: true
      }
    })
    const promiseDatasets = this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets', {
      params: {
        size: (this.config.homeReuses && this.config.homeReuses.size) || 3,
        select: 'id,title,description,dataUpdatedAt,updatedAt,createdAt,createdBy,extras,bbox,image',
        owner: this.$store.getters.owner,
        publicationSites: 'data-fair-portals:' + this.$store.state.portal._id,
        sort: 'createdAt:-1',
        visibility: this.config.authentication === 'none' ? 'public' : '',
        html: true
      }
    })

    // TODO: replace by a proper public stats route
    const promiseStatsDatasets = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets', {
      params: {
        size: 1000,
        select: 'count',
        owner: this.$store.getters.owner,
        publicationSites: 'data-fair-portals:' + this.$store.state.portal._id,
        visibility: this.config.authentication === 'none' ? 'public' : '',
        facets: 'topics'
      }
    })
    this.applications = await promiseApplications
    this.datasets = await promiseDatasets
    const statsDatasets = await promiseStatsDatasets
    this.stats = {
      reuses: {
        count: this.applications.count
      },
      datasets: {
        count: statsDatasets.count,
        numlines: statsDatasets.results.reduce((result, { count }) => result + (count || 0), 0)
      }
    }
    this.topics = statsDatasets.facets.topics || []
  },
  head () {
    const title = this.config.title
    const description = 'Accédez facilement à nos données et découvrez les au travers de visualisations interactives.'
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:url', property: 'og:url', content: this.publicUrl },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ]
      // TODO add DataCatalog schema
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    ...mapGetters(['readableThemeColor']),
    homeUrl () {
      return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/home?draft=${this.$store.state.draft}`
    },
    dataFairUrl () {
      return this.$store.getters.dataFairUrl
    },
    featuredReuseUrl () {
      return `${this.$store.getters.dataFairUrl}/app/${this.config.featuredReuse.id}?embed=true&primary=${encodeURIComponent(this.readableThemeColor)}`
    },
    homeReuseUrl () {
      return `${this.$store.getters.dataFairUrl}/app/${this.config.homeReuse.id}?embed=true&primary=${encodeURIComponent(this.config.themeColor)}`
    },
    showLastApps () {
      return this.config.homeReuses && this.config.homeReuses.type === 'lasts' && this.applications && this.applications.results.length
    },
    showLastDatasets () {
      return this.config.homeDatasets && this.config.homeDatasets.type === 'lasts' && this.datasets && this.datasets.results.length
    },
    tweetLimit () {
      if (this.config.featuredReuse && this.config.featuredReuse.id) return 2
      else return Math.max(1, Math.ceil(((this.config.homeDatasets && this.config.homeDatasets.size) || 0) / 2) + Math.ceil(((this.config.homeReuses && this.config.homeReuses.size) || 0) / 2))
    }
  }
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
