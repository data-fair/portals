<template lang="html">
  <div>
    <h3 class="headline grey--text text--darken-3 font-weight-bold mt-6 mb-4">
      Dernières visualisations
    </h3>
    <v-row>
      <v-col
        v-for="(application, i) in applications.results"
        :key="i"
        v-bind="colProps"
      >
        <application-card
          :layout="config.homeApplications.cardLayout"
          :application="application"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="!config.applicationsPage || config.applicationsPage.type !== 'none'"
      align="center"
    >
      <v-col class="text-center">
        <nav-link
          title="toutes les visualisations"
          to="/applications"
          icon="mdi-open-in-new"
        />
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
    ...mapGetters(['hoverInverse']),
    colProps () {
      if (this.config.homeApplications.cardLayout === 'horizontal') return { cols: 12 }
      else if (this.small) return { cols: 12, sm: 12, md: 6 }
      else return { cols: 12, sm: 6, md: 4 }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
