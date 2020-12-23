<template>
  <div>
    <h2 v-if="value.type === 'title'">
      {{ value.content }}
    </h2>
    <div v-else-if="value.type === 'text'" v-html="marked(value.content).html" />
    <v-responsive v-else-if="value.type === 'datasetTable'" :aspect-ratio="$vuetify.breakpoint.smAndUp ? 2.0 : 1.0">
      <div style="width:1px;min-width:100%;height:1px;min-height:100%;">
        <iframe
          :id="'table-dataset-' + value.dataset.id"
          :src="iframeSrc(value.dataset)"
          height="100%"
          width="100%"
        />
      </div>
    </v-responsive>
    <v-responsive v-else-if="value.type === 'application'" :aspect-ratio="$vuetify.breakpoint.smAndUp ? 1.5 : 1.0">
      <div style="width:1px;min-width:100%;height:1px;min-height:100%;">
        <iframe
          :id="'application-' + value.application.id"
          :src="value.application.exposedUrl + '?embed=true'"
          height="100%"
          width="100%"
          @load="iframeLoaded(value.application)"
        />
      </div>
    </v-responsive>
  </div>
</template>

<script>
import iFrameResize from 'iframe-resizer/js/iframeResizer'
const marked = require('@hackmd/meta-marked')
const { mapState } = require('vuex')

export default {
  props: ['value'],
  computed: {
    ...mapState(['config'])
  },
  methods: {
    marked,
    iframeSrc(dataset) {
      return `${process.env.dataFairUrl}/embed/dataset/${dataset.id}/table?primary=${encodeURIComponent(this.config.themeColor)}`
    },
    iframeLoaded (application) {
      iFrameResize({ log: false }, '#application-' + application.id)
    }
  }
}
</script>

<style lang="css"></style>
