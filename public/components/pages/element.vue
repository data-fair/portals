<template>
  <div
    v-if="value"
    class="page-element"
    :class="{'fill-height': value.fillHeight}"
  >
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
      <v-card-text>
        <k-element
          v-for="(element, i) in value.content"
          :key="i"
          :value="element"
        />
      </v-card-text>
    </v-card>
    <v-card
      v-else-if="value.type === 'cardSimple'"
      outlined
      class="d-flex flex-column fill-height"
    >
      <v-card-title
        class="primary--text text--darken-1 justify-center"
        :class="{'text-h6': value.titleSize === 'normal' || !value.titleSize, 'text-h4': value.titleSize === 'large', 'text-h1': value.titleSize === 'xl'}"
      >
        {{ value.title }}
      </v-card-title>
      <v-card-text
        v-if="value.content"
        style="overflow-wrap: break-word;"
        v-html="$sanitize(marked(value.content))"
      />
      <v-spacer />
      <v-card-actions v-if="value.actions && value.actions.length" class="justify-center mb-2">
        <k-element
          v-for="(action, i) in value.actions"
          :key="i"
          :value="action"
        />
      </v-card-actions>
    </v-card>
    <v-btn
      v-else-if="value.type === 'button' && value.href"
      :href="value.href"
      outlined
      color="primary"
    >
      {{ value.label }}
    </v-btn>
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
      <v-iframe
        v-else-if="value.type === 'iframe' && isValidUrl(value.url)"
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
      isValidUrl(url) {
        try {
          // eslint-disable-next-line no-new
          new URL(url)
          return true
        } catch (err) {
          try {
            // eslint-disable-next-line no-new
            new URL(window.location.origin + url)
            return true
          } catch (err) {
            return false
          }
        }
      },
    },
  }
</script>

<style lang="css">
.page-element .v-alert__content p:last-child {
  margin-bottom: 0;
}
</style>
