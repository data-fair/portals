<template>
  <div v-if="value" class="page-element">
    <v-alert
      v-if="error"
      type="error"
      border="left"
      text
    >
      <div v-text="error" />
    </v-alert>
    <h2 v-else-if="value.type === 'title'">
      {{ value.content }}
    </h2>
    <div
      v-else-if="value.type === 'text' && value.content"
      style="overflow-wrap: break-word;"
      v-html="$sanitize(marked(value.content))"
    />
    <v-alert
      v-else-if="value.type === 'alert' && value.content"
      :type="value.alertType"
      border="left"
      text
    >
      <div v-html="$sanitize(marked(value.content))" />
    </v-alert>
    <div v-else-if="value.type === 'divider'" class="my-6">
      <v-divider />
    </div>
    <dataset-card v-else-if="value.type === 'datasetCard'" :dataset="resolvedDataset" />
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
    <client-only v-else>
      <v-iframe v-if="value.type === 'datasetForm' && value.dataset" :src="formIframeSrc(value.dataset)" />
      <v-iframe v-else-if="value.type === 'datasetTable' && value.dataset" :src="tableIframeSrc(value.dataset)" />
      <v-iframe
        v-else-if="value.type === 'application' && value.application"
        :src="applicationIframeSrc(value.application)"
      />
      <v-img
        v-else-if="value.type === 'image' && value.url"
        :src="value.url"
      />
    </client-only>
  </div>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'
  import DatasetCard from '~/components/dataset/card.vue'
  import marked from 'marked'
  const { mapState } = require('vuex')

  export default {
    name: 'KElement',
    components: { VIframe, DatasetCard },
    props: ['value'],
    data() {
      return {
        loading: false,
        resolvedDataset: null,
        error: null,
      }
    },
    computed: {
      ...mapState(['config']),
    },
    watch: {
      'value.dataset'() {
        this.resolveDataset()
      },
    },
    async created() {
      await this.resolveDataset()
    },
    methods: {
      marked,
      tableIframeSrc(dataset) {
        return `${this.$store.getters.dataFairUrl}/embed/dataset/${dataset.id}/table?primary=${encodeURIComponent(this.config.themeColor)}`
      },
      formIframeSrc(dataset) {
        return `${this.$store.getters.dataFairUrl}/embed/dataset/${dataset.id}/form?primary=${encodeURIComponent(this.config.themeColor)}`
      },
      applicationIframeSrc(application) {
        return `${this.$store.getters.dataFairUrl}/app/${application.id}?embed=true&primary=${encodeURIComponent(this.config.themeColor)}`
      },
      async resolveDataset() {
        this.error = null
        if (this.value.type === 'datasetCard' && this.value.dataset) {
          this.loading = true
          try {
            this.resolvedDataset = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.value.dataset.id)
          } catch (err) {
            this.resolvedDataset = null
            this.error = err.message
          }
          this.loading = false
        } else this.resolvedDataset = null
      },
    },
  }
</script>

<style lang="css">
.page-element .v-alert__content p:last-child {
  margin-bottom: 0;
}
</style>
