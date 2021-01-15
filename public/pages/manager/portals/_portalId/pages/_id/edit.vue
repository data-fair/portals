<template>
  <v-container fluid>
    <v-breadcrumbs :items="breadcrumbItems" large />
    <section-title :text="'Edition de la page ' + ((page && page.title) || '')" />
    <v-form ref="form">
      <v-jsf
        v-if="page"
        :schema="pageSchema"
        :value="page"
        :options="{context: {dataFairUrl, owner}, requiredMessage: 'Information obligatoire', noDataMessage: 'Aucune valeur correspondante', 'searchMessage': 'Recherchez...'}"
        @change="update"
      />
    </v-form>
    <v-row>
      <v-col :cols="6">
        <v-form>
          <v-jsf
            v-if="pageConfig"
            :schema="template"
            :value="pageConfig"
            :options="{httpLib, context: {dataFairUrl}, dialogProps: {maxWidth: 1000}, requiredMessage: 'Information obligatoire', noDataMessage: 'Aucune valeur correspondante', 'searchMessage': 'Recherchez...'}"
            @change="update({ config: pageConfig })"
          />
        </v-form>
      </v-col>
      <v-col v-if="page" :cols="6">
        <blank v-if="page.template === 'blank'" :config="pageConfig" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import VJsf from '@koumoul/vjsf/lib/VJsf.js'
  import '@koumoul/vjsf/lib/deps/third-party.js'
  import '@koumoul/vjsf/dist/main.css'
  import 'iframe-resizer/js/iframeResizer.contentWindow'
  import Blank from '~/components/pages/blank.vue'
  const { mapState } = require('vuex')

  const context = require.context('../../../../../../assets/templates', true, /\.json$/)
  const pageSchema = require('~/../contract/page.json')
  Object.keys(pageSchema.properties).forEach(p => {
    if (pageSchema.properties[p].readOnly) delete pageSchema.properties[p]
  })

  export default {
    components: { VJsf, Blank },
    data: () => ({
      page: null,
      pageConfig: null,
      owner: null,
      pageSchema,
    }),
    computed: {
      ...mapState(['config', 'portal']),
      template() {
        return context(`./${this.page.template}.json`)
      },
      dataFairUrl() {
        return process.env.dataFairUrl
      },
      httpLib () {
        return {
          get: async (url, options) => {
            return await this.$axios.get(url, Object.assign({ withCredentials: true }, options))
          },
        }
      },
      breadcrumbItems() {
        return [
          { text: 'Mes portails', to: { name: 'manager-portals' }, disabled: false, exact: true },
          { text: this.portal.title, to: { name: 'manager-portals-portalId', params: { portalId: this.portal._id } }, disabled: false, exact: true },
          { text: 'Pages', to: { name: 'manager-portals-portalId-pages', params: { portalId: this.portal._id } }, disabled: false, exact: true },
          { text: this.page && this.page.title, disabled: true },
        ]
      },
    },
    mounted: async function () {
      this.page = await this.$axios.$get(process.env.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`)
      this.pageConfig = this.page.config
      delete this.page.config
      if (this.config.owner) this.owner = this.config.owner
    },
    methods: {
      async update (patch) {
        try {
          await this.$axios.$patch(process.env.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${this.$route.params.id}`, patch)
        // this.$router.push({ name: 'pages' })
        } catch (error) { }
      },
    },
  }
</script>
