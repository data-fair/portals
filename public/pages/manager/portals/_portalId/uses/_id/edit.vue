<template>
  <v-container fluid>
    <v-list
      dense
      class="list-actions"
      style="float:right;width:256px;"
    >
      <v-list-item
        v-if="use && use.published"
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

    <section-title :text="'Edition de la réutilisation ' + ((use && use.title) || '')" />

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

const useSchema = require('~/../contract/use')

export default {
  data: () => ({
    fullUse: null,
    use: null,
    useConfig: null,
    useConfigRender: null,
    useSchema
  }),
  computed: {
    ...mapState(['config', 'portal']),
    dataFairUrl () {
      return this.$store.getters.dataFairUrl
    },
    vjsfOpts () {
      return {
        hideReadOnly: true,
        deleteReadOnly: true,
        autofocus: true,
        context: {
          dataFairUrl: this.dataFairUrl,
          publicationSite: 'data-fair-portals:' + this.portal._id
        }
      }
    },
    useLink () {
      const url = new URL(this.portal.link)
      if (!url.pathname.endsWith('/')) url.pathname += '/'
      url.pathname += 'uses/' + this.fullUse.slug
      return url.href
    }
  },
  mounted: async function () {
    this.fullUse = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses/${this.$route.params.id}`)
    this.use = { ...this.fullUse }
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
      const formData = new FormData()
      if (patch.image && patch.image.data) formData.append('image', patch.image.data)
      formData.append('body', JSON.stringify(patch))
      await this.$axios.$patch(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses/${this.$route.params.id}`, formData)
      this.fullUse = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses/${this.$route.params.id}`)
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
