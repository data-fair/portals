<template lang="html">
  <div>
    <error v-if="$fetchState.error" :error="$fetchState.error" />
    <div v-else-if="application">
      <v-container class="py-0">
        <v-row align="start">
          <v-col
            md="4"
            sm="6"
            cols="12"
            :class="{'pt-3 pb-0': true, 'text-center': $vuetify.breakpoint.xs}"
          >
            <a
              v-if="config.website"
              :href="config.website || '/'"
              style="height:100%"
              class="mr-3"
            >
              <img
                :src="logoUrl"
                :alt="config.title"
                style="height:68px"
              >
            </a>
            <nuxt-link
              v-else
              to="/"
              style="height:100%"
              class="mr-3"
            >
              <img
                :src="logoUrl"
                :alt="config.title"
                style="height:68px"
              >
            </nuxt-link>
          </v-col>
          <v-col
            md="8"
            sm="6"
            cols="12"
            :class="{'pt-3 pb-0': true, 'text-center': $vuetify.breakpoint.xs}"
          >
            <v-breadcrumbs :large="!$vuetify.breakpoint.xs" :items="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Visualisations', to: {name: 'reuses'}, exact: true}, {text: application.title, to: {name: 'reuses-id', params: {id: application.id}}, exact: true}, {text: 'Plein écran', disabled: true}]">
              <template slot="divider">
                <v-icon>mdi-chevron-right</v-icon>
              </template>
            </v-breadcrumbs>
          </v-col>
        </v-row>
      </v-container>
      <v-divider />
      <client-only>
        <v-iframe :src="embedUrl + `?embed=true&primary=${encodeURIComponent(config.themeColor)}`" :style="`min-height:${windowHeight - 87}px`" />
      </client-only>
    </div>
  </div>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'
  import Error from '~/components/error.vue'
  import marked from 'marked'
  const { mapState } = require('vuex')

  export default {
    middleware: 'portal-required',
    layout: 'minimal',
    components: { Error, VIframe },
    async fetch () {
      this.application = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/applications/' + this.$route.params.id)
    },
    data: () => ({
      application: null,
    }),
    computed: {
      ...mapState(['config', 'publicUrl', 'portal', 'draft']),
      logoUrl() {
        return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/logo?draft=${this.draft}`
      },
      pageUrl() {
        return this.publicUrl + '/reuses/' + this.$route.params.id + '/full'
      },
      embedUrl() {
        return this.$store.getters.dataFairUrl + '/app/' + this.$route.params.id
      },
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
          { property: 'article:published_time', content: this.application.createdAt },
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
                name: this.application.owner.name,
              },
              dateCreated: this.application.createdAt,
              datePublished: this.application.createdAt,
              dateModified: this.application.updatedAt,
              publisher: require('~/assets/organization.json'),
              image: {
                '@type': 'imageObject',
                url: this.application.href + '/capture',
              },
              thumbnailUrl: this.application.href + '/capture',
            }),
            type: 'application/ld+json',
          },
        ],
      }
    },
  }
</script>
