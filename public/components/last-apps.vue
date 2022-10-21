<template lang="html">
  <div>
    <h3 class="headline grey--text text--darken-3 font-weight-bold mt-6 mb-4">
      Dernières visualisations
    </h3>
    <v-row>
      <v-col
        v-for="(application, i) in applications.results"
        :key="i"
        :md="small ? 6 : 4"
        :sm="small ? 12 : 6"
        :cols="12"
      >
        <application-card :application="application" />
      </v-col>
    </v-row>
    <v-row
      v-if="!config.applicationsPage || config.applicationsPage.type !== 'none'"
      align="center"
    >
      <v-col class="text-center">
        <nuxt-link
          class="title"
          to="/applications"
        >
          <v-icon color="primary">
            mdi-open-in-new
          </v-icon>&nbsp;<span class="underline-link">toutes les visualisations</span>
        </nuxt-link>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    applications: { type: Object, required: true },
    small: { type: Boolean, default: false }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['hoverInverse'])
  }
}
</script>

<style lang="css" scoped>
</style>
