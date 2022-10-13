<template>
  <action-card
    :loading="!dataset"
    :to="dataset && `/datasets/${dataset.id}`"
    :title="dataset && dataset.title"
  >
    <template v-if="dataset">
      <div
        v-if="dataset.image"
        class="pb-2"
        style="height:170px;"
      >
        <v-img
          :src="dataset.thumbnail || dataset.image"
          :alt="dataset.title"
          :max-height="155"
          :contain="!!config.datasetThumbnailContain"
        />
      </div>
      <div
        v-else-if="thumbnailApplication && dataset.extras && dataset.extras.applications && dataset.extras.applications[0]"
        class="pb-2"
        style="height:170px;"
      >
        <v-img
          :src="`${dataFairUrl}/api/v1/applications/${dataset.extras.applications[0].id}/capture?updatedAt=${dataset.extras.applications[0].updatedAt}`"
          :alt="dataset.title"
          :max-height="155"
          :contain="!!config.datasetThumbnailContain"
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
            class="card-gradient-desc170"
            autoresize
            v-html="dataset.description"
          />
        </client-only>
      </v-card-text>
      <v-row
        style="min-height:40px;"
        class="py-1"
      >
        <v-col class="pt-0 pb-1">
          <v-chip
            v-for="topic of dataset.topics"
            :key="topic.id"
            small
            dark
            :color="topic.color ? $readableColor(topic.color) : 'default'"
            class="ml-2 mt-1 font-weight-bold"
          >
            <v-icon
              v-if="topic.icon && topic.icon.name"
              left
              small
            >
              mdi-{{ topic.icon.name }}
            </v-icon>
            {{ topic.title }}
          </v-chip>
        </v-col>
      </v-row>
    </template>
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
          :to="{name: 'datasets-id-full', params:{id: dataset.id}}"
        />
        <map-preview
          v-if="dataset.bbox && dataset.bbox.length"
          :dataset="dataset"
          :color="'primary'"
        />
        <client-only>
          <api-view
            v-if="!isMobileOnly && !dataset.isMetaOnly"
            :dataset="dataset"
            :color="'primary'"
          />
        </client-only>
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
      </v-card-actions>
    </template>
  </action-card>
</template>

<script>
import { isMobileOnly } from 'mobile-device-detect'
import VClamp from 'vue-clamp'
import TablePreview from '~/components/dataset/table-preview.vue'
import MapPreview from '~/components/dataset/map-preview.vue'
import ApiView from '~/components/dataset/api-view.vue'
import SchemaView from '~/components/dataset/schema-view.vue'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    VClamp,
    TablePreview,
    MapPreview,
    ApiView,
    SchemaView
  },
  props: {
    dataset: { type: Object, default: null },
    thumbnailApplication: { type: Boolean, default: false }
  },
  data () {
    return {
      isMobileOnly
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['dataFairUrl'])
  }
}
</script>

<style>
</style>
