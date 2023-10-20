<template>
  <v-container fluid>
    <v-list
      dense
      class="list-actions"
      style="float:right;width:256px;"
    >
      <v-list-item
        :href="pageLink"
        target="_blank"
      >
        <v-list-item-icon>
          <v-icon color="primary">
            mdi-open-in-new
          </v-icon>
        </v-list-item-icon>
        <v-list-item-title>Ouvrir dans le portail</v-list-item-title>
      </v-list-item>
    </v-list>

    <template v-if="page">
      <section-title
        :text="'Edition de la page ' + (page.title || '')"
        tag="h1"
      />

      <v-form ref="form">
        <lazy-v-jsf
          v-model="page"
          :schema="pageSchema"
          :options="vjsfOpts"
          @change="updatePage(page)"
        />
      </v-form>
      <blank
        v-if="page.template === 'blank'"
        :page-config="pageConfig"
        :page="htmlPage"
        @change="updateConfig"
      />
      <thematic
        v-if="page.template === 'thematic'"
        :page-config="pageConfig"
        :page="htmlPage"
        @change="updateConfig"
      />
      <news
        v-if="page.template === 'news'"
        :page-config="pageConfig"
        :page="htmlPage"
        @change="updateConfig"
      />
      <event
        v-if="page.template === 'event'"
        :page-config="pageConfig"
        :page="htmlPage"
        @change="updateConfig"
      />
    </template>
  </v-container>
</template>

<script>
import Blank from '~/components/pages/blank.vue'
import Thematic from '~/components/pages/thematic.vue'
import News from '~/components/pages/news.vue'
import Event from '~/components/pages/event.vue'
const { mapState } = require('vuex')

const pageSchema = require('~/../contract/page.json')
Object.keys(pageSchema.properties).forEach(p => {
  if (pageSchema.properties[p].readOnly) delete pageSchema.properties[p]
})

export default {
  components: { Blank, Thematic, News, Event },
  data: () => ({
    page: null,
    pageConfig: null,
    htmlPage: null,
    owner: null,
    pageSchema
  }),
  computed: {
    ...mapState(['config', 'portal']),
    dataFairUrl () {
      return this.$store.getters.dataFairUrl
    },
    vjsfOpts () {
      const topicsUrl = `${this.dataFairUrl}/api/v1/settings/${this.config.owner.type}/${this.config.owner.id}/topics`
      return {
        context: {
          dataFairUrl: this.dataFairUrl,
          topicsUrl,
          owner: this.owner,
          page: {
            id: this.$route.params.id,
            title: this.page.title
          }
        },
        arrayItemCardProps: { outlined: true, tile: true },
        hideReadOnlyEmpty: true,
        hideReadOnlyTooltips: true,
        hideReadOnlyLabels: true,
        readOnlyFieldProps: { dense: true }
      }
    },
    pageLink () {
      const url = new URL(this.portal.link)
      if (!url.pathname.endsWith('/')) url.pathname += '/'
      url.pathname += 'pages/' + this.$route.params.id
      return url.href
    }
  },
  mounted: async function () {
    this.page = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`)
    this.$store.dispatch('setManagerBreadcrumbs', [{
      text: 'portails',
      to: '/manager/portals'
    }, {
      text: this.portal.title,
      to: `/manager/portals/${this.portal._id}`
    }, {
      text: 'pages',
      to: `/manager/portals/${this.portal._id}/pages`
    }, {
      text: this.page.title
    }])
    this.pageConfig = this.page.config || {}
    delete this.page.config
    if (this.config.owner) this.owner = this.config.owner.type + ':' + this.config.owner.id
    this.htmlPage = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`, { params: { html: true } })
    this.htmlPage.config = this.htmlPage.config || {}
  },
  methods: {
    async updatePage (patch) {
      try {
        this.page = await this.$axios.$patch(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`, patch)
        delete this.page.config
        delete this.page.id
        delete this.page.portal
        delete this.page.created
        delete this.page.updated
        delete this.page.publishedAt
      } catch (error) {
        console.error(error)
      }
    },
    async updateConfig (config) {
      this.pageConfig = { ...this.pageConfig, ...config }
      try {
        this.htmlPage = await this.$axios.$patch(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`, { config: this.pageConfig }, { params: { html: true } })
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style>
.v-application .page-form .vjsf-array {
  padding-top: 16px !important;
}
.v-application .page-form .vjsf-array-item {
  padding-bottom: 0px !important;
  padding-top: 0px !important;
}

.v-application .page-form .vjsf-array-item-active>.v-card {
  border: 1px solid rgba(0, 0, 0, 0.8);
}

.v-application .page-form .vjsf-array-item .v-card__text {
  padding-left: 8px;
  padding-right: 8px;
}
</style>
