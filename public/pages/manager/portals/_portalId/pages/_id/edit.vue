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

    <section-title :text="'Edition de la page ' + ((page && page.title) || '')" />

    <v-form ref="form">
      <lazy-v-jsf
        v-if="page"
        v-model="page"
        :schema="pageSchema"
        :options="vjsfOpts"
        @change="update(page)"
      />
    </v-form>
    <v-row>
      <v-col :cols="6">
        <v-form>
          <lazy-v-jsf
            v-if="pageConfig && template"
            v-model="pageConfig"
            :schema="template"
            :options="vjsfOpts"
            @change="update({ config: pageConfig })"
          />
        </v-form>
      </v-col>
      <v-col
        v-if="page"
        :cols="6"
      >
        <blank
          v-if="page.template === 'blank'"
          :config="pageConfigRender"
        />
        <thematic
          v-if="page.template === 'thematic'"
          :config="pageConfigRender"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import 'iframe-resizer/js/iframeResizer.contentWindow'
import Blank from '~/components/pages/blank.vue'
import Thematic from '~/components/pages/thematic.vue'
const { mapState } = require('vuex')

const context = require.context('../../../../../../assets/templates', true, /\.json$/)
const pageSchema = require('~/../contract/page.json')
Object.keys(pageSchema.properties).forEach(p => {
  if (pageSchema.properties[p].readOnly) delete pageSchema.properties[p]
})

export default {
  components: { Blank, Thematic },
  data: () => ({
    page: null,
    pageConfig: null,
    pageConfigRender: null,
    owner: null,
    pageSchema
  }),
  computed: {
    ...mapState(['config', 'portal']),
    template () {
      return this.page.template && context(`./${this.page.template}.json`)
    },
    dataFairUrl () {
      return this.$store.getters.dataFairUrl
    },
    vjsfOpts () {
      return {
        context: {
          dataFairUrl: this.dataFairUrl,
          settingsUrl: `${this.dataFairUrl}/api/v1/settings/${this.config.owner.type}/${this.config.owner.id}`,
          owner: this.owner
        }
      }
    },
    pageLink () {
      const url = new URL(this.portal.link)
      url.pathname = '/pages/' + this.$route.params.id
      return url.href
    }
  },
  mounted: async function () {
    this.page = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`)
    this.$store.dispatch('setBreadcrumbs', [{
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

    const htmlPage = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`, { params: { html: true } })
    this.pageConfigRender = htmlPage.config
  },
  methods: {
    async update (patch) {
      try {
        const htmlPage = await this.$axios.$patch(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`, patch, { params: { html: true } })
        this.pageConfigRender = htmlPage.config
        // this.$router.push({ name: 'pages' })
      } catch (error) { }
    }
  }
}
</script>
