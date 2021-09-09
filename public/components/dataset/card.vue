<template>
  <v-card
    outlined
    :loading="!dataset"
    min-height="260"
    :elevation="hover ? 4 : 0"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <template v-if="dataset">
      <nuxt-link :to="`/datasets/${dataset.id}`" style="text-decoration:none">
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
                  {{ dataset.title }}
                </v-clamp>
              </h3>
            </template>
            <span>{{ dataset.title }}</span>
          </v-tooltip>
        </v-card-title>
        <div
          v-if="dataset.image"
          class="pb-2"
          style="height:170px;"
        >
          <v-img
            :src="dataset.thumbnail || dataset.image"
            :alt="dataset.title"
            :max-height="155"
            contain
          />
        </div>
        <v-card-text
          v-else
          style="height:170px;color: rgba(0,0,0,0.87)"
          class="py-0"
        >
          <client-only>
            <v-clamp
              :max-height="170"
              class="dataset-desc170"
              autoresize
              v-html="marked(dataset.description || '')"
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
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              :to="{name: 'datasets-id-full', params:{id: dataset.id}}"
              color="primary"
              icon
              v-on="on"
            >
              <v-icon>
                mdi-fullscreen
              </v-icon>
            </v-btn>
          </template>
          <span>Vue tabulaire en plein écran</span>
        </v-tooltip>
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
        <v-subheader>Mis à jour le {{ $dayjs(dataset.dataUpdatedAt).format("DD/MM/YYYY") }}</v-subheader>
        <!-- <v-layout column>
            <span>Mis à jour le {{ dataset.meta.updated }}</span>
            <span>{{ dataset.meta.author }}</span>
          </v-layout> -->
        <!-- <v-btn :to="dataset.href" color="warning" flat exact>Lire la suite</v-btn> -->
      </v-card-actions>
    </template>
  </v-card>
</template>

<script>
  import { isMobileOnly } from 'mobile-device-detect'
  import VClamp from 'vue-clamp'
  import TablePreview from '~/components/dataset/table-preview.vue'
  import MapPreview from '~/components/dataset/map-preview.vue'
  import ApiView from '~/components/dataset/api-view.vue'
  import SchemaView from '~/components/dataset/schema-view.vue'
  import marked from 'marked'

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
    data() {
      return {
        isMobileOnly,
        hover: false,
      }
    },
    methods: {
      marked,
    },
  }
</script>

<style>
.dataset-desc170:before {
  content:'';
  width:100%;
  height:82px;
  position:absolute;
  left:0;
  top:160px;
  background:linear-gradient(transparent 0, white);
}
</style>
