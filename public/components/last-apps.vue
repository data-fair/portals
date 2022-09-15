<template lang="html">
  <div>
    <h3 class="headline grey--text text--darken-2 font-weight-bold mt-6 mb-4">
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
    <v-row align="center">
      <v-col class="text-center">
        <v-btn
          :color="'primary'"
          to="/applications"
          text
          exact
        >
          <v-icon>mdi-open-in-new</v-icon>&nbsp;Toutes les visualisations
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    applications: { type: Object, required: true },
    small: { type: Boolean, default: false }
  }
}
</script>

<style lang="css" scoped>
</style>
