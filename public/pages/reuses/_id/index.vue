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
          <div v-html="application.description" />
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
              <application-fullscreen
                :application="application"
                :synced-state="syncedState"
              />
              <application-capture
                :application="application"
                :base-application="baseApplication"
                :synced-state="syncedState"
              />
            </v-card-actions>
            <v-subheader>Mis à jour le {{ application.updatedAt | date('LL') }}</v-subheader>
          </v-card>
          <v-row v-if="application && application.public">
            <v-spacer />
            <v-col cols="auto">
              <v-subheader :color="'primary'">
                Partager
              </v-subheader>
              <social :title="application.title" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <client-only>
        <v-iframe
          :src="`${dataFairUrl}/app/${$route.params.id}`"
          :sync-state="true"
          :query-params-extra="{primary: readableThemeColor, embed: true}"
          :query-params-exclude="['portalId']"
          @state="s => syncedState = s"
        />
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
            <v-icon>mdi-reply</v-icon>&nbsp;Retourner à la liste
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
const { mapState, mapGetters } = require('vuex')

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
    datasets: null,
    syncedState: null
  }),
  async fetch () {
    const applicationPromise = this.$axios.$get(this.dataFairUrl + '/api/v1/applications/' + this.$route.params.id, { params: { html: true } })
    const baseApplicationPromise = this.$axios.$get(this.dataFairUrl + `/api/v1/applications/${this.$route.params.id}/base-application`, { params: { html: true } })
    const configPromise = this.$axios.$get(this.dataFairUrl + '/api/v1/applications/' + this.$route.params.id + '/configuration')
    this.application = await applicationPromise
    this.baseApplication = await baseApplicationPromise
    const config = await configPromise
    this.datasets = await this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', {
      params: {
        ids: (config.datasets || []).map(d => d.id || d.href.split('/').pop()).join(','),
        select: 'id,title,description,updatedAt,dataUpdatedAt,extras,bbox,topics,image,-userPermissions',
        size: 1000,
        html: true
      }
    })
  },
  head () {
    if (!this.application) return { title: 'Page non trouvée' }
    const description = (this.application.description || this.application.title).split('</p>').shift().replace('<p>', '')
    const imageUrl = new URL(`${this.dataFairUrl}/api/v1/applications/${this.application.id}/capture`)
    const imageWidth = this.meta['df:capture-width'] || '800'
    const imageHeight = this.meta['df:capture-height'] || '450'
    imageUrl.searchParams.set('width', imageWidth)
    imageUrl.searchParams.set('height', imageHeight)
    imageUrl.searchParams.set('updatedAt', this.application.fullUpdatedAt)
    imageUrl.searchParams.set('app_primary', this.readableThemeColor)
    imageUrl.searchParams.set('app_embed', true)
    for (const key in this.$route.query) {
      if (key !== 'portalId') imageUrl.searchParams.set('app_' + key, this.$route.query[key])
    }

    return {
      title: this.application.title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:url', property: 'og:url', content: this.pageUrl },
        { hid: 'og:title', property: 'og:title', content: this.application.title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:image', property: 'og:image', content: imageUrl.href },
        { hid: 'og:image:width', property: 'og:image:width', content: imageWidth },
        { hid: 'og:image:height', property: 'og:image:height', content: imageHeight },
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
              url: imageUrl.href
            },
            thumbnailUrl: imageUrl.href
          }),
          type: 'application/ld+json'
        }
      ]
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl']),
    ...mapGetters(['readableThemeColor', 'dataFairUrl']),
    pageUrl () {
      return this.publicUrl + '/reuses/' + this.$route.params.id
    },
    meta () {
      return (this.baseApplication && this.baseApplication.meta) || {}
    }
  }
}
</script>
