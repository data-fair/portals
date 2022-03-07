<template lang="html">
  <div>
    <!-- <v-container py-0>
      <v-breadcrumbs :items="[{text: 'Les données', to: '/datasets', exact: true}, {text: dataset.title, disabled: true}]"/>
    </v-container>
    <v-divider/> -->
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <v-container v-else-if="dataset">
      <section-title :text="dataset.title" />
      <v-row>
        <v-col
          :md="7"
          :cols="12"
        >
          <img
            v-if="dataset.image"
            :src="dataset.thumbnail || dataset.image"
            :alt="dataset.title"
            class="mb-3"
            style="max-height:300px;max-width:95%"
          >
          <div v-html="marked(dataset.description || '')" />
        </v-col>
        <v-col
          :md="4"
          :offset-md="1"
          :cols="12"
        >
          <v-card
            class="mb-3"
            outlined
          >
            <v-list>
              <v-list-item v-if="!dataset.isMetaOnly">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ (dataset.count || 0).toLocaleString('fr') }} enregistrements
                    <template v-if="dataset.storage && dataset.storage.size">
                      - {{ dataset.storage.size | bytes }}
                    </template>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-if="dataset.origin && (dataset.origin.startsWith('http://') || dataset.origin.startsWith('https://'))">
                    Données issues de <a
                      :href="dataset.origin"
                      rel="external"
                    >cette source</a>
                  </v-list-item-title>
                  <v-list-item-title v-else-if="dataset.origin">
                    Données produites par : <strong>{{ dataset.origin }}</strong>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dataset.license">
                <v-list-item-content>
                  <v-list-item-title>
                    Licence : <a
                      :href="dataset.license.href"
                      rel="external"
                    >{{ dataset.license.title }}</a>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <table-preview
                v-if="!dataset.isMetaOnly"
                :dataset="dataset"
                :color="'primary'"
              />
              <v-tooltip
                v-if="!dataset.isMetaOnly"
                top
              >
                <template #activator="{ on }">
                  <v-btn
                    :to="{name: 'datasets-id-full', params:{id: dataset.id}}"
                    icon
                    color="primary"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-fullscreen
                    </v-icon>
                  </v-btn>
                </template>
                <span>Vue tabulaire en plein écran</span>
              </v-tooltip>
              <map-preview
                v-if="dataset.bbox && dataset.bbox.length"
                :dataset="dataset"
                :color="'primary'"
              />
              <client-only>
                <api-view
                  v-if="!isMobileOnly && !dataset.isMetaOnly"
                  :dataset="dataset"
                  color="primary"
                />
              </client-only>
              <v-tooltip
                v-if="dataFiles && dataFiles.original"
                top
              >
                <template #activator="{ on }">
                  <v-btn
                    :href="dataFiles.original.url"
                    color="primary"
                    icon
                    v-on="on"
                    @click="$ma.trackEvent({action: 'download_data_file', label: dataset.id})"
                  >
                    <v-icon>mdi-download</v-icon>
                  </v-btn>
                </template>
                <span>Télécharger les données originales</span>
              </v-tooltip>
              <v-tooltip
                v-if="dataFiles && dataFiles.full"
                top
              >
                <template #activator="{ on }">
                  <v-btn
                    :href="dataFiles.full.url"
                    icon
                    v-on="on"
                  >
                    <v-icon :color="'primary'">
                      mdi-download-multiple
                    </v-icon>
                  </v-btn>
                </template>
                <span>Télécharger les données enrichies</span>
              </v-tooltip>
              <v-tooltip
                v-if="dataFiles && dataFiles['export-csv']"
                top
              >
                <template #activator="{ on }">
                  <v-btn
                    :href="dataFiles['export-csv'].url"
                    icon
                    v-on="on"
                  >
                    <v-icon :color="'primary'">
                      mdi-download
                    </v-icon>
                  </v-btn>
                </template>
                <span>Télécharger les données (export du {{ dataFiles['export-csv'].updatedAt | date('LL') }})</span>
              </v-tooltip>
              <schema-view
                v-if="!dataset.isMetaOnly"
                :dataset="dataset"
                :color="'primary'"
              />
              <dataset-embed
                v-if="!dataset.isMetaOnly"
                :dataset="dataset"
              />
              <attachments
                v-if="dataset.attachments && dataset.attachments.length"
                :dataset="dataset"
                :color="'primary'"
              />
              <client-only>
                <notif-edit
                  v-if="user && notifyUrl"
                  :dataset="dataset"
                  :color="'primary'"
                />
              </client-only>
            </v-card-actions>
            <v-subheader>Mis à jour le {{ dataset.dataUpdatedAt | date("LL") }}</v-subheader>
          </v-card>
          <v-row>
            <v-spacer />
            <v-col cols="auto">
              <v-subheader :color="'primary'">
                Partager
              </v-subheader>
              <social
                v-if="dataset"
                :url="url"
                :title="dataset.title"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <template v-if="applications">
        <v-row
          v-for="(application, i) in applications.results"
          :key="application.id"
          class="my-3"
          align="center"
        >
          <v-col
            :md="application.preferLargeDisplay ? 12 : 6"
            cols="12"
            class="px-5 py-3"
            :order="0"
            :order-md="application.preferLargeDisplay ? 0 : 1-i%2"
          >
            <nuxt-link
              :to="{name: 'reuses-id', params:{id: application.id}}"
              class="title"
              style="text-decoration-line:none"
            >
              {{ application.title }}&nbsp;<v-icon color="primary">
                mdi-open-in-new
              </v-icon>
            </nuxt-link>
            <div
              class="mt-3"
              v-html="marked(application.description || '')"
            />
          </v-col>
          <v-col
            :md="application.preferLargeDisplay ? 12 : 6"
            cols="12"
            :order="1"
            :order-md="application.preferLargeDisplay ? 1 : i%2"
          >
            <client-only>
              <v-iframe :src="application.exposedUrl + `?embed=true&primary=${encodeURIComponent(config.themeColor)}`" />
            </client-only>
          </v-col>
        </v-row>
      </template>

      <v-row v-if="iframeExternalReuses.length">
        <v-col
          v-for="(reuse, er) in iframeExternalReuses"
          :key="er"
          class="text-center"
        >
          <section-subtitle :text="reuse.title" />
          <client-only>
            <iframe
              v-if="reuse.fixedHeight"
              :src="reuse.link"
              :height="reuse.height"
              width="100%"
              class="mt-2"
            />
            <v-iframe
              v-else
              :src="reuse.link"
              class="mt-2"
            />
          </client-only>
        </v-col>
      </v-row>
      <template v-if="linkExternalReuses.length">
        <section-title
          text="Réutilisations externes"
        />
        <v-row>
          <v-col
            v-for="(reuse, er) in linkExternalReuses"
            :key="er"
            md="4"
            sm="6"
            cols="12"
          >
            <v-card
              outlined
              height="100%"
            >
              <card-title :title="reuse.title" />
              <v-card-text
                style="height:130px;color: rgba(0,0,0,0.87)"
                class="py-0"
              >
                <client-only>
                  <v-clamp
                    :max-height="170"
                    class="external-reuse-desc130:before"
                    autoresize
                    v-html="marked(reuse.description || '')"
                  />
                </client-only>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  :href="reuse.link"
                  target="_blank"
                  color="primary"
                  text
                >
                  Ouvrir
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <v-row class="my-4 text-center">
        <v-col
          cols="12"
        >
          <v-btn
            :color="'primary'"
            to="/datasets"
            text
            exact
          >
            <v-icon>mdi-reply</v-icon>&nbsp;Retourner à la liste des jeux de données
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
import TablePreview from '~/components/dataset/table-preview.vue'
import MapPreview from '~/components/dataset/map-preview.vue'
import ApiView from '~/components/dataset/api-view.vue'
import NotifEdit from '~/components/dataset/notif-edit.vue'
import SchemaView from '~/components/dataset/schema-view.vue'
import Attachments from '~/components/dataset/dataset-attachments.vue'
import DatasetEmbed from '~/components/dataset/embed.vue'
import Social from '~/components/social'
import Error from '~/components/error.vue'
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
import { isMobileOnly } from 'mobile-device-detect'
import marked from 'marked'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    // Disqus,
    TablePreview,
    MapPreview,
    ApiView,
    NotifEdit,
    SchemaView,
    Attachments,
    DatasetEmbed,
    Social,
    Error,
    VIframe
  },
  layout: 'default',
  middleware: 'portal-required',
  data: () => ({
    isMobileOnly,
    dataset: null,
    applications: null,
    dataFiles: null
  }),
  async fetch () {
    const dataset = await this.$axios.$get(`${this.$store.getters.dataFairUrl}/api/v1/datasets/${this.$route.params.id}`)
    this.dataset = dataset

    const params = { select: 'title,description,url,bbox,image,preferLargeDisplay' }
    if (dataset.extras && dataset.extras.reuses && dataset.extras.reuses.length) params.id = dataset.extras.reuses.join(',')
    else params.dataset = this.$route.params.id
    params.publicationSites = 'data-fair-portals:' + this.portal._id
    const applications = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/applications', { params })
    if (dataset.extras && dataset.extras.reuses && dataset.extras.reuses.length) {
      applications.results = dataset.extras.reuses.map(id => applications.results.find(a => a.id === id)).filter(a => a)
    }
    this.applications = applications

    const dataFiles = await this.$axios.$get(`${this.$store.getters.dataFairUrl}/api/v1/datasets/${this.$route.params.id}/data-files`)
    this.dataFiles = dataFiles.reduce((files, file) => { files[file.key] = file; return files }, {})
  },
  head () {
    if (this.dataset) {
      const description = marked(this.dataset.description || this.dataset.title).split('</p>').shift().replace('<p>', '')
      const schema = {
        '@context': 'http://schema.org',
        '@type': 'Dataset',
        url: this.url,
        name: this.dataset.title,
        description,
        author: {
          '@type': this.dataset.owner.type === 'user' ? 'Person' : 'Organization',
          name: this.dataset.owner.name
        },
        creator: {
          '@type': this.dataset.owner.type === 'user' ? 'Person' : 'Organization',
          name: this.dataset.owner.name
        },
        dateCreated: this.dataset.createdAt,
        dateModified: this.dataset.dataUpdatedAt,
        sdPublisher: require('~/assets/organization.json'),
        sdDatePublished: this.dataset.createdAt,
        encodingFormat: 'application/json',
        citation: this.dataset.origin
      }
      if (this.dataset.bbox) {
        schema.spatialCoverage = {
          '@type': 'Place',
          geo: {
            '@type': 'GeoShape',
            box: this.dataset.bbox.slice(0, 2).join(',') + ' ' + this.dataset.bbox.slice(2, 4).join(',')
          }
        }
      }
      if (this.dataset.license && this.dataset.license.href) schema.license = this.dataset.license.href
      if (this.applications && this.applications.count) {
        schema.image = {
          '@type': 'imageObject',
          url: this.applications.results[0].href + '/capture'
        }
        schema.thumbnailUrl = this.applications.results[0].href + '/capture'
      }
      const meta = [
        { hid: 'description', name: 'description', content: description },
        { property: 'og:url', content: this.url },
        { hid: 'og:title', property: 'og:title', content: this.dataset.title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'article:author', content: this.dataset.owner.name },
        { property: 'article:modified_time', content: this.dataset.dataUpdatedAt },
        { property: 'article:published_time', content: this.dataset.createdAt }
      ]
      if (this.applications && this.applications.count) {
        meta.push({ hid: 'og:image', property: 'og:image', content: this.applications.results[0].href + '/capture' })
        meta.push({ hid: 'og:image:width', property: 'og:image:width', content: 800 })
        meta.push({ hid: 'og:image:height', property: 'og:image:height', content: 450 })
      }
      return {
        title: this.dataset.title,
        meta,
        __dangerouslyDisableSanitizers: ['script'],
        script: [
          {
            hid: 'schema',
            innerHTML: JSON.stringify(schema),
            type: 'application/ld+json'
          }
        ]
      }
    } else {
      return { title: 'Page non trouvée' }
    }
  },
  computed: {
    ...mapState(['config', 'portal', 'publicUrl']),
    ...mapGetters(['themeColorDark']),
    ...mapState('session', ['user']),
    url () {
      return this.publicUrl + '/datasets/' + this.$route.params.id
    },
    dataFairUrl () {
      return this.$store.getters.dataFairUrl
    },
    notifyUrl () {
      return this.$store.getters.notifyUrl
    },
    iframeExternalReuses () {
      return (this.dataset && this.dataset.extras && this.dataset.extras.externalReuses && this.dataset.extras.externalReuses.filter(er => er.type === 'embed')) || []
    },
    linkExternalReuses () {
      return (this.dataset && this.dataset.extras && this.dataset.extras.externalReuses && this.dataset.extras.externalReuses.filter(er => er.type === 'link')) || []
    }
  },
  async mounted () {},
  methods: {
    marked
  }
}
</script>

<style>
.external-reuse-desc130:before {
  content:'';
  width:100%;
  height:82px;
  position:absolute;
  left:0;
  top:120px;
  background:linear-gradient(transparent 0, white);
}
</style>
