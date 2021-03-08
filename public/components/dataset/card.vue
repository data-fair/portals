<template>
  <v-hover>
    <v-card
      slot-scope="{ hover }"
      outlined
      :elevation="hover ? 2 : 0"
      :loading="!dataset"
    >
      <template v-if="dataset">
        <nuxt-link :to="`/datasets/${dataset.id}`" style="text-decoration:none">
          <v-card-title>
            <h3 class="title grey--text text--darken-2 font-weight-bold" style="height:40px;line-height: 1.1;">
              <client-only>
                <v-clamp :max-lines="2" autoresize>
                  {{ dataset.title }}
                </v-clamp>
              </client-only>
            </h3>
          </v-card-title>
          <v-card-text style="height:170px;color: rgba(0,0,0,0.87)" class="py-0">
            <client-only>
              <v-clamp
                :max-height="170"
                class="dataset-desc170"
                autoresize
                v-html="marked(dataset.description || '').html"
              />
            </client-only>
          </v-card-text>
          <v-row style="min-height:25px;">
            <v-col class="py-0">
              <v-chip
                v-for="topic of dataset.topics"
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
          <table-preview :dataset="dataset" :color="'primary'" />
          <map-preview
            v-if="dataset.bbox && dataset.bbox.length"
            :dataset="dataset"
            :color="'primary'"
          />
          <api-view
            v-if="!isMobileOnly"
            :dataset="dataset"
            :color="'primary'"
          />
          <schema-view :dataset="dataset" :color="'primary'" />
          <v-spacer />
          <v-subheader>Mis à jour le {{ dataset.updatedAt | moment("DD/MM/YYYY") }}</v-subheader>
        <!-- <v-layout column>
            <span>Mis à jour le {{ dataset.meta.updated }}</span>
            <span>{{ dataset.meta.author }}</span>
          </v-layout> -->
        <!-- <v-btn :to="dataset.href" color="warning" flat exact>Lire la suite</v-btn> -->
        </v-card-actions>
      </template>
    </v-card>
  </v-hover>
</template>

<script>
  import VClamp from 'vue-clamp'
  import TablePreview from '~/components/dataset/table-preview.vue'
  import MapPreview from '~/components/dataset/map-preview.vue'
  import ApiView from '~/components/dataset/api-view.vue'
  import SchemaView from '~/components/dataset/schema-view.vue'
  const marked = require('@hackmd/meta-marked')

  export default {
    components: {
      VClamp,
      TablePreview,
      MapPreview,
      ApiView,
      SchemaView,
    },
    props: {
      dataset: { type: Object },
    },
    methods: {
      marked,
    },
  }
</script>

<style lang="css" scoped>
</style>
