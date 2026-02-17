<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <v-container v-else-if="application">
      <section-title
        :text="application.title"
        tag="h1"
      />
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
            v-bind="infoCardProps"
          >
            <v-list style="background-color: transparent;">
              <v-list-item style="min-height: 36px;">
                <v-list-item-content class="pt-0 pb-2">
                  <v-list-item-title style="white-space: normal;">
                    Visualisation publiée par <span class="font-weight-bold">{{ application.owner.name }}</span> en utilisant l'application <span class="font-weight-bold">{{ baseApplication ? baseApplication.title : application.url.split('/').slice(-3,-2).pop() }}</span>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="application.owner.department && !config.applicationHideDepartment">
                <v-list-item-content class="pt-0 pb-2">
                  <v-list-item-title>
                    <v-avatar
                      :size="28"
                      class="mr-1"
                    >
                      <img :src="`${directoryUrl}/api/avatars/${application.owner.type}/${application.owner.id}/${application.owner.department}/avatar.png`">
                    </v-avatar>
                    {{ application.owner.departmentName || application.owner.department }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-actions class="py-0">
              <application-embed :application="application" />
              <application-fullscreen
                :application="application"
                :synced-state="syncedState"
              />
              <application-capture
                v-if="baseApplication"
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
        <d-frame-wrapper
          :iframe-title="application.title"
          :src="`${dataFairUrl}/app/${$route.params.ref}?d-frame=true&primary=${readablePrimaryColor}`"
          aspect-ratio
          sync-params
          state-change-events
          @state-change="s => syncedState = s.detail[1]"
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

      <v-row
        v-if="!config.applicationsPage || config.applicationsPage.type !== 'none'"
        class="my-4 text-center"
      >
        <v-col cols="12">
          <nav-link
            title="retourner à la liste"
            to="/applications"
            icon="mdi-reply"
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
import ApplicationEmbed from '~/components/application/embed.vue'
import DatasetCard from '~/components/dataset/card.vue'
import Social from '~/components/social'
import Error from '~/components/error.vue'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    // Disqus,
    DatasetCard,
    ApplicationEmbed,
    Social,
    Error,
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
  middleware: 'portal-required',
  data: () => ({
    baseApplication: null,
    application: null,
    datasets: null,
    syncedState: null
  }),
  async fetch () {
    this.application = await this.$axios.$get(this.dataFairUrl + '/api/v1/applications/' + this.$route.params.ref, {
      params: {
        html: true,
        publicationSites: 'data-fair-portals:' + this.portal._id
      }
    })
    const config = await this.$axios.$get(this.dataFairUrl + '/api/v1/applications/' + this.$route.params.ref + '/configuration')
    this.datasets = await this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', {
      params: {
        ids: (config.datasets || []).map(d => d.id || d.href.split('/').pop()).join(','),
        select: 'id,slug,title,description,updatedAt,dataUpdatedAt,extras,bbox,topics,image,-userPermissions',
        size: 1000,
        html: true,
        publicationSites: 'data-fair-portals:' + this.portal._id
      }
    })
  },
  head () {
    if (!this.application) return { title: 'Page non trouvée' }
    const description = (this.application.description || this.application.title).split('</p>').shift().replace('<p>', '')
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
    ...mapState(['config', 'publicUrl', 'portal']),
    ...mapGetters(['readablePrimaryColor', 'dataFairUrl', 'infoCardProps', 'directoryUrl']),
    pageUrl () {
      return this.publicUrl + '/applications/' + this.$route.params.ref
    }
  },
  watch: {
    async application () {
      if (this.application) this.baseApplication = await this.$axios.$get(this.dataFairUrl + `/api/v1/applications/${this.$route.params.ref}/base-application`, { params: { html: true } })
    }
  },
  async mounted () {
    if (this.application) this.baseApplication = await this.$axios.$get(this.dataFairUrl + `/api/v1/applications/${this.$route.params.ref}/base-application`, { params: { html: true } })
  }
}
</script>
