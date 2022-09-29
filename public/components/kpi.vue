<template>
  <v-row
    class="pb-2"
    justify="center"
  >
    <v-col
      sm="4"
      cols="12"
    >
      <v-card v-bind="cardProps">
        <v-card-title class="text-center pb-2">
          <v-col class="pa-0">
            <h3
              class="headline grey--text text--darken-2 font-weight-bold"
              style="height:40px"
            >
              <span v-if="stats">{{ stats.datasets.count }}</span>
              <v-skeleton-loader
                v-else
                max-width="80"
                type="button"
                class="mx-auto"
              />
            </h3>
            <h3
              class="title grey--text text--darken-2 font-weight-bold"
              style="height:40px;text-transform:uppercase;"
            >
              Jeux de données
            </h3>
          </v-col>
        </v-card-title>
      </v-card>
    </v-col>
    <v-col
      sm="4"
      cols="12"
    >
      <v-card v-bind="cardProps">
        <v-card-title class="text-center pb-2">
          <v-col class="pa-0">
            <h3
              class="headline grey--text text--darken-2 font-weight-bold"
              style="height:40px"
            >
              <span v-if="stats">{{ stats.datasets.numlines.toLocaleString() }}</span>
              <v-skeleton-loader
                v-else
                max-width="80"
                type="button"
                class="mx-auto"
              />
            </h3>

            <h3
              class="title grey--text text--darken-2 font-weight-bold"
              style="height:40px;text-transform:uppercase;"
            >
              Enregistrements
            </h3>
          </v-col>
        </v-card-title>
      </v-card>
    </v-col>
    <v-col
      v-if="!config.applicationsPage || config.applicationsPage.type !== 'none'"
      sm="4"
      cols="12"
    >
      <v-card v-bind="cardProps">
        <v-card-title class="text-center pb-2">
          <v-col class="pa-0">
            <h3
              class="headline grey--text text--darken-2 font-weight-bold"
              style="height:40px"
            >
              <span v-if="stats">{{ stats.applications.count }}</span>
              <v-skeleton-loader
                v-else
                max-width="80"
                type="button"
                class="mx-auto"
              />
            </h3>
            <h3
              class="title grey--text text--darken-2 font-weight-bold"
              style="height:40px;text-transform:uppercase;"
            >
              Visualisations
            </h3>
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
    }
  }
}
</script>
