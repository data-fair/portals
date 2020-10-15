<template>
  <!-- smaller screens: navigation in menu -->
  <v-menu bottom left>
    <template v-slot:activator="{ on }">
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
      <v-list-item :to="{name: 'index'}" exact>
        <v-list-item-title>Accueil</v-list-item-title>
      </v-list-item>
      <v-list-item :to="{name: 'datasets'}">
        <v-list-item-title>Les données</v-list-item-title>
      </v-list-item>
      <v-list-item :to="{name: 'reuses'}">
        <v-list-item-title>Visualisations</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="config.contact" :href="config.contact">
        <v-list-item-title>Nous contacter</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="user && user.isAdmin" :to="{name: 'config'}">
        <v-list-item-title>Configuration</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
const { mapState, mapGetters, mapActions } = require('vuex')

export default {
  computed: {
    ...mapState(['config']),
    ...mapState('session', ['user', 'initialized']),
    ...mapGetters(['themeColorDark']),
    ...mapGetters('session', ['activeAccount']),
    directoryUrl() {
      return process.env.directoryUrl
    },
    dataFairUrl() {
      return process.env.dataFairUrl + (process.env.development ? '/' : '')
    }
  },
  methods: {
    ...mapActions('session', ['logout', 'login'])
  }
}
</script>

<style lang="css" scoped>
</style>
