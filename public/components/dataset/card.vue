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
        v-if="dataset && config.datasetActionsDisplay === 'button' && (!$vuetify.breakpoint.smAndUp || ['dense', 'medium', 'vertical'].includes(layout))"
        style="min-height:36px"
        class="pa-1"
      >
        <span
          class="text-caption px-1"
          style="line-height:1rem"
        >
          Mis à jour le {{ (dataset.dataUpdatedAt || dataset.updatedAt) | date('L') }}
        </span>
        <owner-department v-if="!config.datasetHideDepartment" :owner="dataset.owner" />
      </v-card-actions>
      <v-card-actions
        v-if="dataset"
        class="pa-1"
      >
        <table-preview
          v-if="!dataset.isMetaOnly"
          :dataset="dataset"
        />
        <template v-if="!dataset.isMetaOnly">
          <v-btn
            v-if="config.datasetActionsDisplay === 'button'"
            text
            x-small
            color="primary"
            :to="{ name: 'datasets-ref-full', params: { ref: datasetRef } }"
          >
            <v-icon small>
              mdi-table-large
            </v-icon>&nbsp;Tableau
          </v-btn>
          <action-icon
            v-else
            title="Tableau plein écran"
            icon="mdi-table-large"
            :to="{name: 'datasets-ref-full', params:{ref: datasetRef}}"
          />
        </template>
        <map-preview
          v-if="dataset.bbox && dataset.bbox.length"
          :dataset="dataset"
          :color="'primary'"
        />
        <template v-if="!isMobileOnly && !dataset.isMetaOnly && (config.datasetActionsDisplay !== 'button' || !['dense', 'vertical'].includes(layout))">
          <v-btn
            v-if="config.datasetActionsDisplay === 'button'"
            text
            x-small
            color="primary"
            :to="{ name: 'datasets-ref-api-doc', params: { ref: datasetRef } }"
          >
            <v-icon small>
              mdi-cog
            </v-icon>&nbsp;API
          </v-btn>
          <action-icon
            v-else
            title="Documentation d'API"
            icon="mdi-cog"
            :to="{name: 'datasets-ref-api-doc', params:{ref: datasetRef}}"
          />
        </template>
        <schema-view
          v-if="!dataset.isMetaOnly && (config.datasetActionsDisplay !== 'button' || !['dense', 'vertical'].includes(layout))"
          :dataset="dataset"
          :color="'primary'"
        />
        <template v-if="config.datasetActionsDisplay !== 'button' || ($vuetify.breakpoint.smAndUp && !['dense', 'medium', 'vertical'].includes(layout) )">
          <v-spacer />
          <span
            class="text-caption px-1"
            style="line-height:1rem"
          >
            Mis à jour le {{ (dataset.dataUpdatedAt || dataset.updatedAt) | date('L') }}
          </span>
          <owner-department v-if="!config.datasetHideDepartment" :owner="dataset.owner" />
        </template>
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
