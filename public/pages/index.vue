<template>
  <div>
    <template v-if="config.homeImageAsBanner && !config.homeImageHidden">
      <client-only v-if="config.homeApplication">
        <v-iframe
          :src="homeApplicationUrl"
          :class="`elevation-${appBarElevation}`"
          style="margin-top: -11px;height: 400px;"
        />
      </client-only>
      <v-row
        v-else
        justify="center"
        class="ma-0"
      >
        <v-img
          :src="homeUrl"
          :alt="config.title"
          height="400px"
          max-width="1904px"
          :class="`elevation-${appBarElevation}`"
          :style="`margin-top: ${config.appBarTransparency ? -76 : -11}px;`"
        />
      </v-row>
      <v-container
        v-if="config.homeShowSearch && config.homeSearchPosition === 'overBanner'"
        :style="`position:relative;top: ${config.appBarTransparency ? -230 : -260}px;height:0;`"
      >
        <v-row justify="center">
          <nav-home-search />
        </v-row>
      </v-container>
      <v-container
        v-if="config.homeShowTopics && config.homeTopicsPosition === 'overBanner'"
        :style="`position:relative;top: ${config.appBarTransparency ? -210 : -240}px;height:0;`"
      >
        <topics
          :topics="topics"
          :options="config.homeTopicsOptions"
        />
      </v-container>
    </template>
    <v-container>
      <v-row v-if="!config.homeImageAsBanner && !config.homeImageHidden">
        <v-col
          cols="12"
          md="5"
          offset-md="1"
        >
          <client-only v-if="config.homeApplication">
            <v-iframe
              :src="homeApplicationUrl"
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
      <v-row
        v-if="config.homeShowSearch && config.homeSearchPosition === 'belowBanner'"
        justify="center"
        class="pt-6 pb-4"
      >
        <nav-home-search />
      </v-row>
      <topics
        v-if="config.homeShowTopics && config.homeTopicsPosition === 'belowBanner'"
        :topics="topics"
        :options="config.homeTopicsOptions"
        row-class="mt-0 mb-3"
      />
      <layout-links
        v-if="config.homeShowLinks && config.homeLinks && config.homeLinks.length"
        :links="config.homeLinks"
        :options="config.homeLinksOptions"
      />
      <kpi
        v-if="config.showKpis"
        class="mt-4"
        :stats="stats"
      />
      <v-row
        v-if="config.homeShowSearch && config.homeSearchPosition === 'belowKpi'"
        justify="center"
        class="py-4"
      >
        <nav-home-search />
      </v-row>
      <topics
        v-if="config.homeShowTopics && config.homeTopicsPosition === 'belowKpi'"
        :topics="topics"
        :options="config.homeTopicsOptions"
      />

      <!-- 2/3 layout when we have a twitter timeline or anything else to display to the right -->
      <v-row v-if="twoThirdsLayout">
        <v-col
          cols="12"
          md="8"
          sm="6"
          align-self="stretch"
        >
          <template v-if="config.featuredApplication && config.featuredApplication.id">
            <application-featured
              :application="config.featuredApplication"
              iframe-style="height:90%"
            />
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
          <client-only v-if="showTwitterTimeline">
            <timeline
              :id="config.twitter"
              :source-type="'profile'"
              :options="{ tweetLimit }"
            />
          </client-only>
          <news-last v-if="config.showLastNews" />
        </v-col>
      </v-row>

      <!-- vertical layout full width -->
      <template v-else>
        <v-row v-if="config.featuredApplication && config.featuredApplication.id">
          <v-col
            md="10"
            offset-md="1"
            cols="12"
            class="my-3 grow"
          >
            <application-featured :application="config.featuredApplication" />
          </v-col>
        </v-row>
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
    topics: []
  }),
  async fetch () {
    const baseFilter = {
      owner: this.owner,
      publicationSites: 'data-fair-portals:' + this.portal._id,
      visibility: this.config.authentication === 'none' ? 'public' : ''
    }
    const [applications, datasets] = await Promise.all([
      this.$axios.$get(this.dataFairUrl + '/api/v1/applications', {
        params: {
          ...baseFilter,
          size: (this.config.homeApplications && this.config.homeApplications.size) || 3,
          select: 'id,title,updatedAt,createdAt,-userPermissions',
          sort: 'createdAt:-1',
          html: true
        }
      }),
      this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', {
        params: {
          ...baseFilter,
          size: (this.config.homeDatasets && this.config.homeDatasets.size) || 3,
          select: 'id,title,description,dataUpdatedAt,updatedAt,createdAt,extras,bbox,image,-userPermissions',
          sort: (this.config.datasetsDefaultSort || 'createdAt') + ':-1',
          html: true,
          truncate: 600,
          sums: 'count',
          facets: 'topics'
        }
      })
    ])

    this.applications = applications
    this.datasets = datasets
    this.stats = {
      applications: {
        count: this.applications.count
      },
      datasets: {
        count: this.datasets.count,
        numlines: this.datasets.sums.count
      }
    }
    const topicsFacets = this.datasets.facets.topics || []
    this.topics = topicsFacets.map(f => ({ ...f.value, count: f.count }))
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
    ...mapGetters(['readableThemeColor', 'dataFairUrl', 'owner', 'appBarElevation']),
    homeUrl () {
      return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/home?draft=${this.draft}&hash=${this.config.assets.home && this.config.assets.home.hash}`
    },
    homeApplicationUrl () {
      return `${this.dataFairUrl}/app/${this.config.homeApplication.id}?embed=true&primary=${encodeURIComponent(this.readableThemeColor)}`
    },
    showLastApps () {
      return this.config.homeApplications && this.config.homeApplications.type === 'lasts' && this.applications && this.applications.results.length
    },
    showLastDatasets () {
      return this.config.homeDatasets && this.config.homeDatasets.type === 'lasts' && this.datasets && this.datasets.results.length
    },
    tweetLimit () {
      if (this.config.featuredApplication && this.config.featuredApplication.id) return 2
      else return Math.max(1, Math.ceil(((this.config.homeDatasets && this.config.homeDatasets.size) || 0) / 2) + Math.ceil(((this.config.homeApplications && this.config.homeApplications.size) || 0) / 2))
    },
    showTwitterTimeline () {
      return this.config.twitter && this.config.showTwitterTimeline !== false
    },
    twoThirdsLayout () {
      return this.showTwitterTimeline || this.config.showLastNews
    }
  }
}

</script>

<style>
</style>
