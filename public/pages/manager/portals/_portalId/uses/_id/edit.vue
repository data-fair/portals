<template>
  <v-container fluid>
    <v-list
      dense
      class="list-actions"
      style="float:right;width:256px;"
    >
      <v-list-item
        :href="useLink"
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

    <section-title :text="'Edition de l\'utilisation ' + ((use && use.title) || '')" />

    <v-form ref="form">
      <lazy-v-jsf
        v-if="use"
        v-model="use"
        :schema="useSchema"
        :options="vjsfOpts"
        @change="update(use)"
      />
    </v-form>
  </v-container>
</template>

<script>
const { mapState } = require('vuex')

const context = require.context('../../../../../../assets/templates', true, /\.json$/)
const useSchema = require('~/../contract/use.json')
Object.keys(useSchema.properties).forEach(p => {
  if (useSchema.properties[p].readOnly) delete useSchema.properties[p]
})

export default {
  data: () => ({
    use: null,
    useConfig: null,
    useConfigRender: null,
    owner: null,
    useSchema
  }),
  computed: {
    ...mapState(['config', 'portal']),
    template () {
      return this.use.template && context(`./${this.use.template}.json`)
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
        },
        arrayItemCardProps: { outlined: true, tile: true },
        hideReadOnlyEmpty: true,
        hideReadOnlyTooltips: true,
        hideReadOnlyLabels: true,
        readOnlyFieldProps: { dense: true }
      }
    },
    useLink () {
      const url = new URL(this.portal.link)
      if (!url.pathname.endsWith('/')) url.pathname += '/'
      url.pathname += 'uses/' + this.$route.params.id
      return url.href
    }
  },
  mounted: async function () {
    this.use = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses/${this.$route.params.id}`)
    this.$store.dispatch('setBreadcrumbs', [{
      text: 'portails',
      to: '/manager/portals'
    }, {
      text: this.portal.title,
      to: `/manager/portals/${this.portal._id}`
    }, {
      text: 'utilisations',
      to: `/manager/portals/${this.portal._id}/uses`
    }, {
      text: this.use.title
    }])
  },
  methods: {
    async update (patch) {
      try {
        await this.$axios.$patch(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses/${this.$route.params.id}`, patch)
        // this.$router.push({ name: 'uses' })
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style>
.v-application .use-form .vjsf-array {
  padding-top: 16px !important;
}
.v-application .use-form .vjsf-array-item {
  padding-bottom: 0px !important;
  padding-top: 0px !important;
}

.v-application .use-form .vjsf-array-item-active>.v-card {
  border: 1px solid rgba(0, 0, 0, 0.8);
}

.v-application .use-form .vjsf-array-item .v-card__text {
  padding-left: 8px;
  padding-right: 8px;
}
</style>
