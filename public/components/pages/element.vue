<template>
  <div v-if="value">
    <h2 v-if="value.type === 'title'">
      {{ value.content }}
    </h2>
    <div v-else-if="value.type === 'text'" v-html="marked(value.content).html" />
    <v-iframe
      v-else-if="value.type === 'datasetForm' && value.dataset"
      :id="'form-dataset-' + value.dataset.id"
      :src="formIframeSrc(value.dataset)"
    />
    <iframe
      v-else-if="value.type === 'datasetTable' && value.dataset"
      :id="'table-dataset-' + value.dataset.id"
      :aspect-ratio="$vuetify.breakpoint.smAndUp ? 2.0 : 1.0"
      :src="tableIframeSrc(value.dataset)"
    />
    <v-iframe
      v-else-if="value.type === 'application' && value.application"
      :src="value.application.exposedUrl + '?embed=true'"
      @load="iframeLoaded(value.application)"
    />
  </div>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'
  const marked = require('@hackmd/meta-marked')
  const { mapState } = require('vuex')

  export default {
    components: { VIframe },
    props: ['value'],
    computed: {
      ...mapState(['config']),
    },
    methods: {
      marked,
      tableIframeSrc(dataset) {
        return `${process.env.dataFairUrl}/embed/dataset/${dataset.id}/table?primary=${encodeURIComponent(this.config.themeColor)}`
      },
      formIframeSrc(dataset) {
        return `${process.env.dataFairUrl}/embed/dataset/${dataset.id}/form?primary=${encodeURIComponent(this.config.themeColor)}`
      },
    },
  }
</script>

<style lang="css"></style>
