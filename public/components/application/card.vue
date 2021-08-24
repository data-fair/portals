<template lang="html">
  <v-card
    outlined
    :elevation="hover ? 4 : 0"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <nuxt-link :to="{name: 'reuses-id', params:{id: application.id}}" style="text-decoration:none">
      <v-card-title>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <h3
              class="title grey--text text--darken-2 font-weight-bold"
              style="height:40px;line-height: 1.1;"
              v-bind="attrs"
              v-on="on"
            >
              <v-clamp
                :max-lines="2"
                autoresize
              >
                {{ application.title }}
              </v-clamp>
            </h3>
          </template>
          <span>{{ application.title }}</span>
        </v-tooltip>
      </v-card-title>
      <div class="pb-2">
        <v-img
          :src="`${application.href}/capture`"
          :alt="application.title"
          aspect-ratio="3"
        />
      </div>
      <v-row style="min-height:25px;">
        <v-col class="py-0">
          <v-chip
            v-for="topic of application.topics"
            :key="topic.id"
            small
            outlined
            :color="topic.color || 'default'"
            class="ml-2"
            style="font-weight: bold"
          >
            {{ topic.title }}
          </v-chip>
        </v-col>
      </v-row>
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
      <v-subheader>Mis à jour le {{ application.updatedAt | moment("DD/MM/YYYY") }}</v-subheader>
    </v-card-actions>
  </v-card>
</template>

<script>
  import VClamp from 'vue-clamp'
  import ApplicationView from '~/components/application/view.vue'

  const marked = require('@hackmd/meta-marked')

  export default {
    components: {
      VClamp,
      ApplicationView,
    },
    props: {
      application: { type: Object },
    },
    data() {
      return {
        hover: false,
      }
    },
    methods: {
      marked,
    },
  }
</script>

<style lang="css" scoped>
</style>
