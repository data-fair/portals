<template>
  <div>
    <v-card
      v-bind="infoCardProps"
    >
      <v-card-title>
        <h2 class="headline grey--text text--darken-3 font-weight-bold">
          Dernières actualités
        </h2>
      </v-card-title>
      <v-card-text>
        <v-row v-if="newsRes">
          <v-col
            v-for="(news, i) in newsRes.results"
            :key="i"
            cols="12"
            class="pa-0"
          >
            <news-card
              :news="news"
              layout="list"
            />
            <v-divider v-if="i < newsRes.results.length - 1" />
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
      v-if="newsRes && !loading"
      align="center"
      class="my-0"
    >
      <v-col class="text-center">
        <nav-link
          title="toutes les actualités"
          to="/news"
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
      newsRes: null,
      loading: false
    }
  },
  async fetch () {
    const params = {
      html: true,
      published: true,
      template: 'news',
      select: 'id,title,config,publishedAt,published',
      sort: 'publishedAt:-1',
      size: 3
    }
    this.loading = true
    this.newsRes = await this.$axios.$get(`/api/v1/portals/${this.portal._id}/pages`, { params })
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
