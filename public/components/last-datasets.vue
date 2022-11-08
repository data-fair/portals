<template lang="html">
  <div>
    <h3 class="headline grey--text text--darken-3 font-weight-bold mb-4 mt-6">
      Derniers jeux de données
    </h3>
    <v-row>
      <v-col
        v-for="(dataset, i) in datasets.results"
        :key="i"
        v-bind="colProps"
      >
        <dataset-card
          :layout="config.homeDatasets.cardLayout"
          :dataset="dataset"
          :thumbnail-application="config.datasetThumbnailApplication"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="!config.datasetsPage || config.datasetsPage.type !== 'none'"
      align="center"
    >
      <v-col class="text-center">
        <nav-link
          title="toutes les données"
          to="/datasets"
          icon="mdi-open-in-new"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { isMobileOnly } from 'mobile-device-detect'
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    datasets: { type: Object, required: true },
    small: { type: Boolean, default: false }
  },
  data: () => ({
    isMobileOnly
  }),
  computed: {
    ...mapState(['config']),
    ...mapGetters(['hoverInverse']),
    colProps () {
      if (this.config.homeDatasets.cardLayout === 'horizontal') return { cols: 12 }
      else if (this.small) return { cols: 12, sm: 12, md: 6 }
      else return { cols: 12, sm: 6, md: 4 }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
