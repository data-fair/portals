<template lang="html">
  <div>
    <v-container>
      <section-title :text="application.title" />
      <v-row>
        <v-col md="7" sm="12">
          <div v-html="marked(application.description || '').html" />
        </v-col>
        <v-col
          md="4"
          offset-md="1"
          sm="12"
        >
          <v-card class="mb-3" outlined>
            <v-card-text class="subheading">
              Visualisation publiée par <span class="font-weight-bold">{{ application.owner.name }} en utilisant l'application <span class="font-weight-bold">{{ baseApplication ? baseApplication.title : application.url.split('/').slice(-3,-2).pop() }}</span></span>
            </v-card-text>
            <v-card-actions>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    v-on="on"
                    @click="embedDialog=true"
                  >
                    <v-icon :color="'primary'">
                      mdi-code-tags
                    </v-icon>
                  </v-btn>
                </template>
                <span>Intégrer dans un site</span>
                <v-dialog
                  v-model="embedDialog"
                  :fullscreen="$vuetify.breakpoint.mdAndDown"
                  :max-width="1200"
                >
                  <v-card>
                    <v-toolbar dense flat>
                      <v-toolbar-title>Intégrer dans un site</v-toolbar-title>
                      <v-spacer />
                      <v-btn icon @click.native="embedDialog = false">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-toolbar>
                    <v-card-text>
                      Pour intégrer cette application dans un site vous pouvez copier le code suivant dans le contenu HTML de votre site.
                      <code class="pa-2 mt-2">&lt;iframe src="{{ embedUrl }}?embed=true" width="100%" height="500px" style="background-color: transparent; border: none;"&gt;&lt;/iframe&gt;</code>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </v-tooltip>
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
              <!-- <v-tooltip top>
                <v-btn slot="activator" :href="embedUrl" icon>
                  <v-icon color="primary">mdi-exit-to-app</v-icon>
                </v-btn>
                <span>Accéder à la visualisation en plein écran sans la barre de navigation</span>
              </v-tooltip> -->
            </v-card-actions>
            <v-subheader>Mis à jour le {{ application.updatedAt | moment("DD/MM/YYYY") }}</v-subheader>
          </v-card>
        </v-col>
      </v-row>

      <iframe
        v-if="baseApplication && baseApplication.applicationName === 'Liste et fiches'"
        id="reuse-frame"
        :src="embedUrl + '?embed=true'"
        height="100%"
        width="100%"
        @load="iframeLoaded"
      />
      <v-col
        v-else
        md="10"
        offset-md="1"
        sm="12"
        class="my-3 grow"
      >
        <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndUp ? 1.5 : 1.0">
          <div style="width:1px;min-width:100%;height:1px;min-height:100%;">
            <iframe
              :src="embedUrl + '?embed=true'"
              height="100%"
              width="100%"
            />
          </div>
        </v-responsive>
      </v-col>

      <section-subtitle text="Données utilisées" />
      <v-container v-if="datasets" fluid>
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
                height="100%"
                outlined
                :elevation="hover ? 2 : 0"
              >
                <nuxt-link :to="`/datasets/${dataset.id}`" style="text-decoration:none">
                  <v-card-title style="height:50%">
                    <h3 class="title grey--text text--darken-2 font-weight-bold">
                      {{ dataset.title }}
                    </h3>
                  </v-card-title>
                </nuxt-link>
                <v-card-actions style="height:50%">
                  <v-spacer />
                  <table-preview :dataset="dataset" :color="'primary'" />
                  <map-preview
                    v-if="dataset.bbox"
                    :dataset="dataset"
                    :color="'primary'"
                  />
                  <api-view :dataset="dataset" :color="'primary'" />
                  <v-tooltip v-if="dataset.file" top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :href="dataFairUrl+'/api/v1/datasets/'+dataset.id +'/raw'"
                        :color="'primary'"
                        icon
                        v-on="on"
                      >
                        <v-icon>mdi-download</v-icon>
                      </v-btn>
                    </template>
                    <span>Télécharger les données</span>
                  </v-tooltip>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>

      <v-row class="mb-4 align-center">
        <v-col
          cols="12"
          sm="6"
          md="8"
        >
          <v-btn
            :color="'primary'"
            to="/reuses"
            text
            exact
          >
            <v-icon>mdi-reply</v-icon>&nbsp;Retourner à la liste des visualisations
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
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

      <!-- <section-subtitle text="Discussion"/>
      <disqus/> -->
    </v-container>
  </div>
</template>

<script>
// import Disqus from '../../../components/disqus.vue'
import TablePreview from '../../../components/dataset/table-preview.vue'
import MapPreview from '../../../components/dataset/map-preview.vue'
import ApiView from '../../../components/dataset/api-view.vue'
import Social from '~/components/social'
import iFrameResize from 'iframe-resizer/js/iframeResizer'
const { mapState } = require('vuex')
const marked = require('@hackmd/meta-marked')

export default {
  components: {
    // Disqus,
    TablePreview,
    MapPreview,
    ApiView,
    Social
  },
  async asyncData ({ app, env, params, error }) {
    try {
      const application = await app.$axios.$get(env.dataFairUrl + '/api/v1/applications/' + params.id, { withCredentials: true })
      const config = await app.$axios.$get(env.dataFairUrl + '/api/v1/applications/' + params.id + '/configuration', { withCredentials: true })
      const datasets = await app.$axios.$get(env.dataFairUrl + '/api/v1/datasets', { params: { ids: (config.datasets || []).map(d => d.id || d.href.split('/').pop()).join(',') }, withCredentials: true })
      return { application, datasets }
    } catch (err) {
      error({ statusCode: err.response.status })
    }
  },
  data: () => ({
    embedDialog: null,
    marked,
    baseApplication: null
  }),
  computed: {
    ...mapState(['config', 'publicUrl']),
    pageUrl() {
      return process.env.publicUrl + '/reuses/' + this.$route.params.id
    },
    embedUrl() {
      return process.env.dataFairUrl + '/app/' + this.$route.params.id
    },
    description() {
      return marked(this.application.description).html
    },
    dataFairUrl() {
      return process.env.dataFairUrl
    }
  },
  async mounted() {
    this.baseApplication = await this.$axios.$get(process.env.dataFairUrl + `/api/v1/applications/${this.application.id}/base-application`, { withCredentials: true })
  },
  methods: {
    iframeLoaded () {
      iFrameResize({ log: false }, '#reuse-frame')
    }
  },
  head () {
    const description = marked(this.application.description || this.application.title).html.split('</p>').shift().replace('<p>', '')
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
  }
}
</script>
