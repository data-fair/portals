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
      />
      <v-subheader
        class="px-0"
      >
        Publiée le {{ use.publishedAt | date('L') }} par {{ use.author }}.
      </v-subheader>
      <v-row class="mt-3 mb-6 mx-0">
        <v-btn
          v-for="linkType of linkTypes.filter(lt => use.links && use.links[lt.key])"
          :key="linkType.key"
          fab
          small
          :href="use.links[linkType.key]"
          color="primary"
          class="mx-1"
          :title="linkTitle(linkType.title, use.links[linkType.key])"
        >
          <v-icon>{{ linkType.icon }}</v-icon>
        </v-btn>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="5"
          offset-md="1"
        >
          <v-img
            v-if="use.image"
            :src="`${publicUrl}/api/v1/portals/${portal._id}/uses/${use._id}/image`"
            :alt="use.title"
            min-height="200"
            max-height="600"
            contain
          />
        </v-col>
        <v-col
          class="pt-2 order-md-first"
          cols="12"
          md="6"
        >
          <div
            v-if="use.description"
            v-html="use.description"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="use.links && use.links.iframe"
        class="mt-4"
      >
        <client-only>
          <v-iframe :src="use.links.iframe" />
        </client-only>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import VIframe from '@koumoul/v-iframe'
const { mapState } = require('vuex')

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
    ]
  }),
  async fetch () {
    await this.fetchuse()
  },
  head () {
    if (this.use) {
      return { title: this.use.title }
    } else {
      return { title: 'Réutilisation non trouvée' }
    }
  },
  computed: {
    ...mapState(['portal', 'publicUrl'])
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
