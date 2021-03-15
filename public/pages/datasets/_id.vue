<template lang="html">
  <div>
    <!-- <v-container py-0>
      <v-breadcrumbs :items="[{text: 'Les données', to: '/datasets', exact: true}, {text: dataset.title, disabled: true}]"/>
    </v-container>
    <v-divider/> -->
    <error v-if="$fetchState.error" :error="$fetchState.error" />
    <v-container v-else-if="dataset">
      <section-title :text="dataset.title" />
      <v-row>
        <v-col md="7" sm="12">
          <div v-html="marked(dataset.description || '').html" />
        </v-col>
        <v-col
          md="4"
          offset-md="1"
          sm="12"
        >
          <v-card class="mb-3" outlined>
            <v-list>
              <v-list-item v-if="dataset.origin">
                <v-list-item-content>
                  <v-list-item-title>Données issues de <a :href="dataset.origin" rel="external">cette source</a></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dataset.license">
                <v-list-item-content>
                  <v-list-item-title>Licence : <a :href="dataset.license.href" rel="external">{{ dataset.license.title }}</a></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <table-preview :dataset="dataset" :color="'primary'" />
              <map-preview
                v-if="dataset.bbox && dataset.bbox.length"
                :dataset="dataset"
                :color="'primary'"
              />
              <api-view
                v-if="!isMobileOnly"
                :dataset="dataset"
                :color="'primary'"
              />
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
                <span>Télécharger les données originales</span>
              </v-tooltip>
              <v-tooltip v-if="dataset.file && dataset.extensions && dataset.extensions.find(e => e.active)" top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    :href="dataFairUrl + '/api/v1/datasets/' + dataset.id + '/full'"
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
              <schema-view :dataset="dataset" :color="'primary'" />
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
            <v-subheader>Mis à jour le {{ dataset.updatedAt | moment("DD/MM/YYYY") }}</v-subheader>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="applications">
        <v-col>
          <v-row
            v-for="(application, i) in applications.results"
            :key="application.id"
            :reverse="i%2 !== 1"
            class="my-3"
            align="center"
          >
            <template v-if="baseApplications[application.url] && baseApplications[application.url].applicationName === 'Liste et fiches'">
              <v-col class="text-center">
                <nuxt-link
                  :to="{name: 'reuses-id', params:{id: application.id}}"
                  class="title"
                  style="text-decoration-line:none"
                >
                  {{ application.title }}&nbsp;<v-icon color="primary">
                    mdi-open-in-new
                  </v-icon>
                </nuxt-link>
                <v-iframe :src="application.exposedUrl + `?embed=true&primary=${encodeURIComponent(config.themeColor)}`" class="mt-2" />
              </v-col>
            </template>
            <template v-else>
              <v-col
                md="6"
                sm="12"
                class="px-5 py-3"
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
                <div class="mt-3" v-html="marked(application.description || '').html" />
              </v-col>
              <v-col md="6" sm="12">
                <v-iframe :src="application.exposedUrl + `?embed=true&primary=${encodeURIComponent(config.themeColor)}`" />
              </v-col>
            </template>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-if="dataset.extras && dataset.extras.externalReuses">
        <v-col
          v-for="(reuse, er) in dataset.extras.externalReuses.filter(r => r.type==='embed')"
          :key="er"
          class="text-center"
        >
          <section-subtitle :text="reuse.title" />
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
        </v-col>
        <section-title v-if="dataset.extras && dataset.extras.externalReuses && dataset.extras.externalReuses.filter(r => r.type==='link').length" text="Réutilisations externes" />
        <v-row v-if="dataset.extras && dataset.extras.externalReuses">
          <v-col
            v-for="(reuse, er) in dataset.extras.externalReuses.filter(r => r.type==='link')"
            :key="er"
            md="4"
            sm="6"
            cols="12"
          >
            <v-card raised height="100%">
              <v-card-title style="height:30%">
                <card-title :text="reuse.title" />
              </v-card-title>
              <v-card-text>
                <div v-html="marked(reuse.description || '').html" />
              </v-card-text>
              <v-card-actions style="height:20%">
                <v-spacer />
                <v-btn
                  :href="reuse.link"
                  target="_blank"
                  color="primary"
                >
                  Accéder
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-row>

      <v-row class="mb-4 align-center">
        <v-col
          cols="12"
          sm="6"
          md="8"
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
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
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
  import Social from '~/components/social'
  import Error from '~/components/error.vue'
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'
  import { isMobileOnly } from 'mobile-device-detect'
  const { mapState } = require('vuex')
  const marked = require('@hackmd/meta-marked')

  export default {
    middleware: 'portal-required',
    layout: 'default',
    components: {
      // Disqus,
      TablePreview,
      MapPreview,
      ApiView,
      NotifEdit,
      SchemaView,
      Attachments,
      Social,
      Error,
      VIframe,
    },
    async fetch () {
      const dataset = await this.$axios.$get(process.env.dataFairUrl + '/api/v1/datasets/' + this.$route.params.id, { withCredentials: true })
      const params = { select: 'title,description,url,bbox' }
      if (dataset.extras && dataset.extras.reuses && dataset.extras.reuses.length) params.id = dataset.extras.reuses.join(',')
      else params.dataset = this.$route.params.id
      params.publicationSites = 'data-fair-portals:' + this.portal._id
      const applications = await this.$axios.$get(process.env.dataFairUrl + '/api/v1/applications', { params, withCredentials: true })
      if (dataset.extras && dataset.extras.reuses && dataset.extras.reuses.length) {
        applications.results = dataset.extras.reuses.map(id => applications.results.find(a => a.id === id)).filter(a => a)
      }
      this.dataset = dataset
      this.applications = applications
    },
    data: () => ({
      baseApplications: {},
      isMobileOnly,
      dataset: null,
      applications: null,
    }),
    computed: {
      ...mapState(['config', 'portal']),
      ...mapState('session', ['user']),
      url() {
        return process.env.publicUrl + '/datasets/' + this.$route.params.id
      },
      dataFairUrl() {
        return process.env.dataFairUrl
      },
      notifyUrl() {
        return process.env.notifyUrl
      },
    },
    async mounted() {
      const baseApps = await this.$axios.$get(process.env.dataFairUrl + '/api/v1/base-applications', { params: { size: 1000 }, withCredentials: true })
      this.baseApplications = Object.assign({}, ...baseApps.results.map(a => ({ [a.url]: a })))
    },
    methods: {
      marked,
    },
    head () {
      if (this.dataset) {
        const description = marked(this.dataset.description || this.dataset.title).html.split('</p>').shift().replace('<p>', '')
        const schema = {
          '@context': 'http://schema.org',
          '@type': 'Dataset',
          url: this.url,
          name: this.dataset.title,
          author: {
            '@type': this.dataset.owner.type === 'user' ? 'Person' : 'Organization',
            name: this.dataset.owner.name,
          },
          dateCreated: this.dataset.createdAt,
          dateModified: this.dataset.updatedAt,
          sdPublisher: require('~/assets/organization.json'),
          sdDatePublished: this.dataset.createdAt,
          encodingFormat: 'application/json',
          citation: this.dataset.origin,
        }
        if (this.dataset.bbox) {
          schema.spatialCoverage = {
            '@type': 'Place',
            geo: {
              '@type': 'GeoShape',
              box: this.dataset.bbox.slice(0, 2).join(',') + ' ' + this.dataset.bbox.slice(2, 4).join(','),
            },
          }
        }
        if (this.dataset.license && this.dataset.license.href) schema.license = this.dataset.license.href
        if (this.applications && this.applications.count) {
          schema.image = {
            '@type': 'imageObject',
            url: this.applications.results[0].href + '/capture',
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
          { property: 'article:modified_time', content: this.dataset.updatedAt },
          { property: 'article:published_time', content: this.dataset.createdAt },
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
              type: 'application/ld+json',
            },
          ],
        }
      } else {
        return { title: 'Page non trouvée' }
      }
    },
  }
</script>
