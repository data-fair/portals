<template>
  <v-app v-if="config">
    <layout-dynamic-style
      html-overflow="scroll"
      :apply-fonts="false"
    />
    <client-only><accept-cookies /></client-only>

    <layout-personal-app-bar :nav-context="navContext" />

    <layout-personal-navigation :nav-context="navContext" />

    <v-main>
      <client-only>
        <nuxt-child />
        <layout-notifications />
      </client-only>
    </v-main>

    <layout-scroll-to-top />
  </v-app>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  data: () => ({
    navContext: {
      drawer: true
    }
  }),
  head () {
    return this.portalHead(this.$route)
  },
  computed: {
    ...mapState(['config']),
    ...mapState('session', ['user']),
    ...mapGetters(['portalHead'])
  },
  mounted () {
    if (!this.user) return this.$router.push('/')
  }
}

</script>

<style>
</style>
