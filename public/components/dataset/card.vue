<template>
  <card-action-card
    :loading="!dataset"
    :to="dataset && `/datasets/${datasetRef}`"
    :title="dataset && dataset.title"
    :img="img"
    :img-contain="!!config.datasetThumbnailContain"
    :html="dataset && dataset.description"
    :topics="dataset && dataset.topics"
    :layout="layout"
  >
    <template #bottom>
      <v-card-actions
        v-if="dataset"
        class="pa-1"
      >
        <table-preview
          v-if="!dataset.isMetaOnly"
          :dataset="dataset"
        />
        <action-icon
          v-if="!dataset.isMetaOnly"
          title="Vue tabulaire en plein écran"
          icon="mdi-fullscreen"
          :to="{name: 'datasets-ref-full', params:{ref: datasetRef}}"
        />
        <map-preview
          v-if="dataset.bbox && dataset.bbox.length"
          :dataset="dataset"
          :color="'primary'"
        />
        <action-icon
          v-if="!isMobileOnly && !dataset.isMetaOnly"
          title="Documentation d'API"
          icon="mdi-cog"
          :to="{name: 'datasets-ref-api-doc', params:{ref: datasetRef}}"
        />
        <schema-view
          v-if="!dataset.isMetaOnly"
          :dataset="dataset"
          :color="'primary'"
        />
        <v-spacer />
        <span
          class="text-caption px-1"
          style="line-height:1rem"
        >
          Mis à jour le {{ (dataset.dataUpdatedAt || dataset.updatedAt) | date('L') }}
        </span>
        <owner-department :owner="dataset.owner" />
      </v-card-actions>
    </template>
  </card-action-card>
</template>

<script>
import { isMobileOnly } from 'mobile-device-detect'
import TablePreview from '~/components/dataset/table-preview.vue'
import MapPreview from '~/components/dataset/map-preview.vue'
import SchemaView from '~/components/dataset/schema-view.vue'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    TablePreview,
    MapPreview,
    SchemaView
  },
  props: {
    dataset: { type: Object, default: null },
    thumbnailApplication: { type: Boolean, default: false },
    layout: { type: String, default: 'dense' }
  },
  data () {
    return {
      isMobileOnly
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['dataFairUrl', 'isPublished']),
    datasetRef () {
      return this.isPublished ? this.dataset.slug : this.dataset.id
    },
    img () {
      if (!this.dataset) return null
      if (this.dataset.image) return this.dataset.thumbnail || this.dataset.image
      if (this.thumbnailApplication && this.dataset.extras && this.dataset.extras.applications && this.dataset.extras.applications[0]) {
        return `${this.dataFairUrl}/api/v1/applications/${this.dataset.extras.applications[0].id}/capture?updatedAt=${this.dataset.extras.applications[0].updatedAt}`
      }
      return null
    }
  }
}
</script>

<style>
</style>
