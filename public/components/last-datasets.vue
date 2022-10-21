<template lang="html">
  <div>
    <h3 class="headline grey--text text--darken-3 font-weight-bold mb-4 mt-6">
      Derniers jeux de données
    </h3>
    <v-row>
      <v-col
        v-for="(dataset, i) in datasets.results"
        :key="i"
        :md="small ? 6 : 4"
        :sm="small ? 12 : 6"
        :cols="12"
      >
        <dataset-card
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
        <nuxt-link
          class="title"
          to="/datasets"
        >
          <v-icon color="primary">
            mdi-open-in-new
          </v-icon>&nbsp;<span class="underline-link">toutes les données</span>
        </nuxt-link>
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
    ...mapGetters(['hoverInverse'])
  }
}
</script>

<style lang="css" scoped>
</style>
