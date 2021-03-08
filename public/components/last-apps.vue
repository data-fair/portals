<template lang="html">
  <div>
    <h3 :class="`headline grey--text text--darken-2 font-weight-bold ${fullWidth ? 'mt-2 mb-2' : 'mt-6 mb-4'}`">
      Dernières valorisations
    </h3>
    <v-container
      class="pa-0"
      fluid
    >
      <v-row>
        <v-col
          v-for="(application, i) in applications.results"
          :key="i"
          :md="fullWidth ? 12 : 4"
          :sm="fullWidth ? 12 : 6"
          :cols="12"
        >
          <v-hover>
            <v-card
              slot-scope="{ hover }"
              outlined
              :elevation="hover ? 2 : 0"
            >
              <nuxt-link :to="`/reuses/${application.id}`" style="text-decoration:none">
                <v-card-title class="py-2">
                  <h3 class="title grey--text text--darken-2 font-weight-bold">
                    <client-only>
                      <v-clamp :max-lines="1" autoresize>
                        {{ application.title }}
                      </v-clamp>
                    </client-only>
                  </h3>
                </v-card-title>
                <div>
                  <v-img
                    :src="`${application.href}/capture`"
                    :alt="application.title"
                    aspect-ratio="4"
                  />
                </div>
              </nuxt-link>
              <v-card-actions class="py-0">
                <application-view :application="application" />
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :to="{name: 'reuses-id-full', params:{id: application.id}}"
                      icon
                      v-on="on"
                    >
                      <v-icon color="primary">
                        mdi-fullscreen
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Accéder à la visualisation en plein écran</span>
                </v-tooltip>
                <v-spacer />
                <v-subheader>
                  Mis à jour le {{ application.updatedAt | moment("DD/MM/YYYY") }}
                </v-subheader>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
    <v-row align="center">
      <v-col class="text-center">
        <v-btn
          :color="'primary'"
          to="/reuses"
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
  import ApplicationView from '~/components/application/application-view.vue'
  import VClamp from 'vue-clamp'

  export default {
    components: {
      ApplicationView,
      VClamp,
    },
    props: {
      applications: { type: Object, required: true },
      fullWidth: { type: Boolean, default: false },
    },
  }
</script>

<style lang="css" scoped>
</style>
