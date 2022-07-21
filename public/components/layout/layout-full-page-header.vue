<template>
  <v-app-bar
    flat
    color="white"
    app
  >
    <div style="height:100%;max-width:30%;">
      <a
        v-if="config.website"
        :href="config.website || '/'"
        style="height: 100%"
      >
        <img
          :src="logoUrl"
          style="height: 100%:"
          :alt="config.title"
        >
      </a>
      <nuxt-link
        v-else
        to="/"
        style="height: 100%"
      >
        <v-img
          :src="logoUrl"
          style="height: 100%;"
          :alt="config.title"
          contain
        />
      </nuxt-link>
    </div>
    <v-spacer />
    <v-breadcrumbs
      v-if="[{text: 'Accueil', to: {name: 'index'}, exact: true}, {text: 'Données', to: {name: 'datasets'}, exact: true}, {text: dataset.title, to: {name: 'datasets-id', params: {id: dataset.id}}, exact: true}, {text: 'Plein écran', disabled: true}]"
      :large="!$vuetify.breakpoint.xs"
      :items="breadcrumbs"
      class="px-1"
      :class="{dense: $vuetify.breakpoint.xs}"
    >
      <template slot="divider">
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>
    <v-spacer />
  </v-app-bar>
</template>

<script>
const { mapState } = require('vuex')

export default {
  props: {
    breadcrumbs: { type: Array, default: null }
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    logoUrl () {
      return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/logo?draft=${this.draft}&hash=${this.config.assets.logo && this.config.assets.logo.hash}`
    }
  }
}
</script>

<style>
.v-breadcrumbs.dense li:nth-child(even) {
  padding: 0 0;
}
</style>
