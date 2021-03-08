<template>
  <div v-if="value">
    <h2 v-if="value.type === 'title'">
      {{ value.content }}
    </h2>
    <div v-else-if="value.type === 'text' && value.content" v-html="marked(value.content).html" />
    <v-alert
      v-else-if="value.type === 'alert' && value.content"
      :type="value.alertType"
      border="left"
      text
    >
      <div v-html="marked(value.content).html" />
    </v-alert>
    <div v-else-if="value.type === 'divider'" class="my-6">
      <v-divider />
    </div>
    <v-row v-else-if="value.type === 'datasetCard'">
      <v-col
        md="4"
        sm="6"
        cols="12"
      >
        <dataset-card :dataset="resolvedDataset" />
      </v-col>
    </v-row>
    <v-card
      v-else-if="value.type === 'card'"
      class="my-6"
    >
      <v-card-title>{{ value.title }}</v-card-title>
      <v-card-text>
        <k-element
          v-for="(element, i) in value.content"
          :key="i"
          :value="element"
        />
      </v-card-text>
    </v-card>
    <v-iframe
      v-else-if="value.type === 'datasetForm' && value.dataset"
      :src="formIframeSrc(value.dataset)"
    />
    <v-iframe
      v-else-if="value.type === 'datasetTable' && value.dataset"
      :aspect-ratio="$vuetify.breakpoint.smAndUp ? 2.0 : 1.0"
      :src="tableIframeSrc(value.dataset)"
    />
    <v-iframe
      v-else-if="value.type === 'application' && value.application"
      :src="value.application.exposedUrl + '?embed=true'"
    />
  </div>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'
  import DatasetCard from '~/components/dataset/card.vue'
  const marked = require('@hackmd/meta-marked')
  const { mapState } = require('vuex')

  export default {
    name: 'KElement',
    components: { VIframe, DatasetCard },
    props: ['value'],
    data() {
      return {
        loading: false,
        resolvedDataset: null,
      }
    },
    computed: {
      ...mapState(['config']),
    },
    async created() {
      if (this.value.type === 'datasetCard' && this.value.dataset) {
        this.loading = true
        this.resolvedDataset = await this.$axios.$get(process.env.dataFairUrl + '/api/v1/datasets/' + this.value.dataset.id)
        this.loading = false
      }
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
