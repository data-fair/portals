<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <v-container v-else-if="application">
      <section-title :text="application.title" />
      <v-row>
        <v-col
          md="7"
          cols="12"
        >
          <div v-html="marked(application.description || '')" />
        </v-col>
        <v-col
          md="4"
          offset-md="1"
          cols="12"
        >
          <v-card
            class="mb-3"
            outlined
          >
            <v-card-text class="subheading">
              Visualisation publiée par <span class="font-weight-bold">{{ application.owner.name }} en utilisant l'application <span class="font-weight-bold">{{ baseApplication ? baseApplication.title : application.url.split('/').slice(-3,-2).pop() }}</span></span>
            </v-card-text>
            <v-card-actions>
              <application-embed :application="application" />
              <v-tooltip top>
                <template #activator="{ on }">
                  <v-btn
                    :to="{name: 'reuses-id-full', params:{id: application.id}}"
                    icon
                    nuxt
                    v-on="on"
                  >
                    <v-icon color="primary">
                      mdi-fullscreen
                    </v-icon>
                  </v-btn>
                </template>
                <span>Accéder à la visualisation en plein écran</span>
              </v-tooltip>
            </v-card-actions>
            <v-subheader>Mis à jour le {{ application.updatedAt | date('LL') }}</v-subheader>
          </v-card>
          <v-row>
            <v-spacer />
            <v-col cols="auto">
              <v-subheader :color="'primary'">
                Partager
              </v-subheader>
              <social
                v-if="application"
                :url="pageUrl"
                :title="application.title"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <client-only>
        <v-iframe :src="embedUrl + `?embed=true&primary=${encodeURIComponent(config.themeColor)}`" />
      </client-only>

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

      <v-row class="my-4 text-center">
        <v-col cols="12">
          <v-btn
            :color="'primary'"
            to="/reuses"
            text
            exact
          >
            <v-icon>mdi-reply</v-icon>&nbsp;Retourner à la liste des visualisations
          </v-btn>
        </v-col>
      </v-row>

      <!-- <section-subtitle text="Discussion"/>
      <disqus/> -->
    </v-container>
  </div>
</template>

<script>
// import Disqus from '~/components/disqus.vue'
import ApplicationEmbed from '~/components/application/embed.vue'
import DatasetCard from '~/components/dataset/card.vue'
import Social from '~/components/social'
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
import Error from '~/components/error.vue'
import marked from 'marked'
const { mapState } = require('vuex')

export default {
  components: {
    // Disqus,
    DatasetCard,
    ApplicationEmbed,
    Social,
    Error,
    VIframe
  },
  middleware: 'portal-required',
  data: () => ({
    baseApplication: null,
    application: null,
    datasets: null
  }),
  async fetch () {
    this.application = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/applications/' + this.$route.params.id)
    const config = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/applications/' + this.$route.params.id + '/configuration')
    this.datasets = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets', {
      params: {
        ids: (config.datasets || []).map(d => d.id || d.href.split('/').pop()).join(','),
        select: 'id,title,description,updatedAt,updatedBy,extras,bbox,topics,image',
        size: 1000
      }
    })
  },
  head () {
    if (!this.application) return { title: 'Page non trouvée' }
    const description = marked(this.application.description || this.application.title).split('</p>').shift().replace('<p>', '')
    return {
      title: this.application.title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:url', property: 'og:url', content: this.pageUrl },
        { hid: 'og:title', property: 'og:title', content: this.application.title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:image', property: 'og:image', content: this.application.href + '/capture' },
        { hid: 'og:image:width', property: 'og:image:width', content: 800 },
        { hid: 'og:image:height', property: 'og:image:height', content: 450 },
        { hid: 'og:type', property: 'og:type', content: 'article' },
        { property: 'article:author', content: this.application.owner.name },
        { property: 'article:modified_time', content: this.application.updatedAt },
        { property: 'article:published_time', content: this.application.createdAt }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: [
        {
          hid: 'schema',
          innerHTML: JSON.stringify({
            '@context': 'http://schema.org',
            '@type': 'WebApplication',
            url: this.url,
            name: this.application.title,
            description,
            author: {
              '@type': this.application.owner.type === 'user' ? 'Person' : 'Organization',
              name: this.application.owner.name
            },
            dateCreated: this.application.createdAt,
            datePublished: this.application.createdAt,
            dateModified: this.application.updatedAt,
            publisher: require('~/assets/organization.json'),
            image: {
              '@type': 'imageObject',
              url: this.application.href + '/capture'
            },
            thumbnailUrl: this.application.href + '/capture'
          }),
          type: 'application/ld+json'
        }
      ]
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl']),
    pageUrl () {
      return this.publicUrl + '/reuses/' + this.$route.params.id
    },
    embedUrl () {
      return this.$store.getters.dataFairUrl + '/app/' + this.$route.params.id
    },
    description () {
      return marked(this.application.description)
    },
    dataFairUrl () {
      return this.$store.getters.dataFairUrl
    }
  },
  watch: {
    async application () {
      if (this.application) this.baseApplication = await this.$axios.$get(this.$store.getters.dataFairUrl + `/api/v1/applications/${this.application.id}/base-application`)
    }
  },
  async mounted () {
    if (this.application) this.baseApplication = await this.$axios.$get(this.$store.getters.dataFairUrl + `/api/v1/applications/${this.application.id}/base-application`)
  },
  methods: {
    marked
  }
}
</script>
