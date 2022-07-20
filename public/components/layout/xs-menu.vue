<template>
  <!-- smaller screens: navigation in menu -->
  <v-menu
    bottom
    left
  >
    <template #activator="{ on }">
      <v-btn
        v-show="$vuetify.breakpoint.smAndDown"
        icon
        color="primary"
        v-on="on"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        :to="{name: 'index'}"
        exact
        nuxt
      >
        <v-list-item-title>Accueil</v-list-item-title>
      </v-list-item>
      <v-list-item
        :to="{name: 'datasets'}"
        nuxt
      >
        <v-list-item-title>Données</v-list-item-title>
      </v-list-item>
      <v-list-item
        :to="{name: 'reuses'}"
        nuxt
      >
        <v-list-item-title>Visualisations</v-list-item-title>
      </v-list-item>
      <template v-if="pages">
        <v-list-item
          v-for="page in pages.filter(p => p.navigation && p.navigation.type === 'direct')"
          :key="page.id"
          :to="{name: 'pages-id', params: {id: page.id}}"
          nuxt
        >
          <v-list-item-title>{{ page.title }}</v-list-item-title>
        </v-list-item>
        <div
          v-for="menu in extraMenus"
          :key="menu"
        >
          <v-subheader>{{ menu }}</v-subheader>
          <v-list-item
            v-for="page in pages.filter(p => p.navigation && p.navigation.type === 'menu' && p.navigation.title === menu)"
            :key="page.id"
            :to="{name: 'pages-id', params: {id: page.id}}"
            nuxt
          >
            <v-list-item-title>{{ page.title }}</v-list-item-title>
          </v-list-item>
        </div>
      </template>
      <v-list-item
        v-if="config.contactEmail"
        :to="{name: 'contact'}"
        nuxt
      >
        <v-list-item-title>Contact</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
const { mapState } = require('vuex')

export default {
  props: ['pages', 'extraMenus'],
  computed: {
    ...mapState(['config']),
    directoryUrl () {
      return this.$store.getters.directoryUrl
    },
    dataFairUrl () {
      return this.$store.getters.dataFairUrl + (process.env.development ? '/' : '')
    }
  }
}
</script>

<style lang="css" scoped>
</style>
