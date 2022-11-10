<template>
  <v-row
    class="pb-2"
    justify="center"
  >
    <!-- hidden but present to improve accessibility -->
    <h2 class="hide-element">
      Métriques
    </h2>
    <v-col
      v-for="metric,i of metrics"
      :key="i"
      sm="4"
      cols="12"
    >
      <v-card v-bind="cardProps">
        <v-card-title class="text-center pb-2">
          <v-col class="pa-0">
            <span
              class="headline grey--text text--darken-3 font-weight-bold"
              style="height:40px;display:block;"
            >
              <template v-if="stats">
                {{ metric.value }}
              </template>
              <v-skeleton-loader
                v-else
                max-width="80"
                type="button"
                class="mx-auto"
              />
            </span>
            <span
              class="title grey--text text--darken-3 font-weight-bold"
              style="height:40px;text-transform:uppercase;display:block;"
            >
              {{ metric.title }}
            </span>
          </v-col>
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: ['stats'],
  computed: {
    ...mapState(['config']),
    ...mapGetters(['kpiOptions', 'kpiBackgroundColor', 'elevation']),
    cardProps () {
      return {
        shaped: this.kpiOptions.includes('shaped'),
        elevation: this.kpiOptions.includes('elevate') ? this.elevation : 0,
        class: this.kpiOptions.includes('outlined') ? 'also-outlined' : '',
        style: `background-color:${this.kpiBackgroundColor}`
      }
    },
    metrics () {
      const metrics = [
        { value: this.stats && this.stats.datasets.count, title: 'Jeux de données' },
        { value: this.stats && this.stats.datasets.numlines, title: 'Enregistrements' }
      ]
      if (!this.config.applicationsPage || this.config.applicationsPage.type !== 'none') {
        metrics.push({ value: this.stats && this.stats.applications.count, title: 'Visualisations' })
      }
      return metrics
    }
  }
}
</script>
