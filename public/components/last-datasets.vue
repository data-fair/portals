<template lang="html">
  <div>
    <h3 class="headline grey--text text--darken-2 font-weight-bold mb-4 mt-6">
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
        <v-hover>
          <v-card
            slot-scope="{ hover }"
            outlined
            :elevation="hover ? 2 : 0"
          >
            <nuxt-link :to="`/datasets/${dataset.id}`" style="text-decoration:none">
              <v-card-title>
                <h3 class="title grey--text text--darken-2 font-weight-bold" style="height:40px;line-height:1.1;">
                  <client-only>
                    <v-clamp :max-lines="2" autoresize>
                      {{ dataset.title }}
                    </v-clamp>
                  </client-only>
                </h3>
              </v-card-title>
              <v-img
                v-if="dataset.image"
                :src="dataset.thumbnail || dataset.image"
                :alt="dataset.title"
                :height="200"
                :contain="!!config.datasetThumbnailContain"
              />
              <v-card-text
                v-else
                style="height:200px;color: rgba(0,0,0,0.87)"
                class="py-0"
              >
                <client-only>
                  <v-clamp
                    :max-height="200"
                    autoresize
                    class="dataset-desc200"
                    v-html="marked(dataset.description || '')"
                  />
                </client-only>
              </v-card-text>
            </nuxt-link>
            <v-card-actions class="py-0">
              <table-preview :dataset="dataset" :color="'primary'" />
              <map-preview
                v-if="dataset.bbox && dataset.bbox.length"
                :dataset="dataset"
                :color="'primary'"
              />
              <client-only>
                <api-view
                  v-if="!isMobileOnly"
                  :dataset="dataset"
                  :color="'primary'"
                />
              </client-only>
              <schema-view :dataset="dataset" :color="'primary'" />
              <v-spacer />
              <v-subheader>Mis à jour le {{ $dayjs(dataset.dataUpdatedAt).format("DD/MM/YYYY") }}</v-subheader>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col class="text-center">
        <v-btn
          :color="'primary'"
          to="/datasets"
          text
          exact
        >
          <v-icon>mdi-open-in-new</v-icon>&nbsp;Toutes les données
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>

  import TablePreview from '~/components/dataset/table-preview.vue'
  import MapPreview from '~/components/dataset/map-preview.vue'
  import ApiView from '~/components/dataset/api-view.vue'
  import SchemaView from '~/components/dataset/schema-view.vue'
  import VClamp from 'vue-clamp'
  import { isMobileOnly } from 'mobile-device-detect'
  import marked from 'marked'
  import { mapState } from 'vuex'

  export default {
    components: {
      TablePreview,
      MapPreview,
      ApiView,
      SchemaView,
      VClamp,
    },
    props: {
      datasets: { type: Object, required: true },
      small: { type: Boolean, default: false },
    },
    data: () => ({
      isMobileOnly,
    }),
    computed: {
      ...mapState(['config']),
    },
    methods: {
      marked,
    },
  }
</script>

<style lang="css" scoped>
</style>
