<template lang="html">
  <v-container>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <template v-else-if="use">
      <section-title
        :text="use.title"
        class="mb-0"
        tag="h1"
      />
      <v-subheader
        class="px-0"
      >
        Publiée le {{ use.publishedAt | date('L') }} par {{ use.author }}.
      </v-subheader>
      <v-row class="mt-3 mb-6 mx-0">
        <v-hover
          v-for="linkType of linkTypes.filter(lt => use.links && use.links[lt.key])"
          v-slot="{hover}"
          :key="linkType.key"
        >
          <v-btn
            fab
            small
            :href="use.links[linkType.key]"
            color="primary"
            class="mx-1 white--text"
            :outlined="hover && hoverInverse"
            :title="linkTitle(linkType.title, use.links[linkType.key])"
            target="_blank"
          >
            <v-icon>{{ linkType.icon }}</v-icon>
          </v-btn>
        </v-hover>
      </v-row>
      <v-row>
        <v-col
          cols="12"
        >
          <div
            v-if="use.description"
            v-html="use.description"
          />
        </v-col>
        <v-col
          v-if="use.links && use.links.iframe"
          cols="12"
        >
          <client-only>
            <v-iframe
              :title="use.title"
              :src="use.links.iframe"
            />
          </client-only>
        </v-col>
        <v-col
          v-else-if="use.image"
          cols="12"
        >
          <a
            v-if="use.links.web || use.links.android || use.links.ios"
            :href="use.links.web || use.links.android || use.links.ios"
            target="_blank"
          >
            <v-img
              :src="`${publicUrl}/api/v1/portals/${portal._id}/uses/${use._id}/image`"
              :alt="use.title"
              min-height="200"
              max-height="600"
              contain
            />
          </a>
          <v-img
            v-else
            :src="`${publicUrl}/api/v1/portals/${portal._id}/uses/${use._id}/image`"
            :alt="use.title"
            min-height="200"
            max-height="600"
            contain
          />
        </v-col>
      </v-row>
      <section-subtitle text="Données utilisées" />
      <v-container
        v-if="datasets"
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
            <dataset-card :dataset="dataset" />
          </v-col>
        </v-row>
      </v-container>
    </template>
    <v-row
      v-if="config.usesPage && config.usesPage.type !== 'none'"
      class="my-4 text-center"
    >
      <v-col cols="12">
        <nav-link
          title="retourner à la liste"
          to="/uses"
          icon="mdi-reply"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VIframe from '@koumoul/v-iframe'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    VIframe
  },
  layout: 'default',
  middleware: 'portal-required',
  data: () => ({
    use: null,
    linkTypes: [
      { key: 'web', icon: 'mdi-web', title: 'Ouvrir la page Web sur ' },
      { key: 'android', icon: 'mdi-android', title: 'Voir l\'application Android sur ' },
      { key: 'ios', icon: 'mdi-apple-ios', title: 'Voir l\'application IOS sur ' }
    ],
    datasets: null
  }),
  async fetch () {
    await this.fetchuse()
    this.datasets = await this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', {
      params: {
        slugs: (this.use.datasets || []).map(d => d.slug || d.id).join(','),
        publicationSites: `data-fair-portals:${this.portal._id}`,
        select: 'id,slug,title,description,updatedAt,dataUpdatedAt,extras,bbox,topics,image,-userPermissions,isMetaOnly',
        size: 1000,
        html: true
      }
    })
  },
  head () {
    if (this.use) {
      return { title: this.use.title }
    } else {
      return { title: 'Réutilisation non trouvée' }
    }
  },
  computed: {
    ...mapState(['portal', 'publicUrl', 'config']),
    ...mapGetters(['dataFairUrl', 'hoverInverse'])
  },
  watch: {
    async '$route.params.id' () {
      await this.fetchuse()
    }
  },
  methods: {
    async fetchuse () {
      this.use = (await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses`, { params: { html: true, slug: this.$route.params.slug } })).results[0]
    },
    linkTitle (prefix, link) {
      return prefix + new URL(link).host
    }
  }
}
</script>
