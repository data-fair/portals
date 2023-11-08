<template>
  <div>
    <v-card
      v-bind="infoCardProps"
    >
      <v-card-title>
        <h2 class="headline grey--text text--darken-3 font-weight-bold">
          Evenements à venir
        </h2>
      </v-card-title>
      <v-card-text>
        <v-row v-if="eventsRes">
          <v-col
            v-for="(event, i) in eventsRes.results"
            :key="i"
            cols="12"
            class="pa-0"
          >
            <events-card
              :event="event"
              layout="list"
            />
            <v-divider v-if="i < eventsRes.results.length - 1" />
          </v-col>
        </v-row>
        <v-row
          v-if="loading"
          class="py-5"
          align="center"
        >
          <v-col class="text-center pa-0">
            <v-progress-circular
              :size="40"
              :width="5"
              :color="'primary'"
              indeterminate
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-row
      v-if="eventsRes && !loading"
      align="center"
      class="my-0"
    >
      <v-col class="text-center">
        <nav-link
          title="tous les évènements"
          to="/events"
          icon="mdi-open-in-new"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  data: function () {
    return {
      eventsRes: null,
      loading: false
    }
  },
  async fetch () {
    const params = {
      html: true,
      published: true,
      template: 'event',
      select: 'id,title,config',
      sort: 'config.datetimes.start:1',
      size: 3,
      'future-events': true
    }
    this.loading = true
    this.eventsRes = await this.$axios.$get(`/api/v1/portals/${this.portal._id}/pages`, { params })
    this.eventsRes.results.reverse()
    this.loading = false
  },
  computed: {
    ...mapState(['portal']),
    ...mapGetters(['infoCardProps'])
  }
}
</script>

<style>
</style>
