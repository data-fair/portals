<template>
  <div
    v-if="value"
    :class="`page-element page-element-${value.type} ${value.fillHeight ? 'fill-height' : ''}`"
  >
    <v-alert
      v-if="error"
      type="error"
      border="left"
      text
    >
      <div v-text="error" />
    </v-alert>
    <h2
      v-else-if="value.type === 'title'"
      :class="titleClass"
    >
      <v-icon
        v-if="value.icon"
        left
        :class="titleClass"
      >
        mdi-{{ value.icon.name }}
      </v-icon>
      {{ value.content }}
    </h2>
    <div
      v-else-if="value.type === 'text' && value.content"
      style="overflow-wrap: break-word;"
      class="pb-6"
      v-html="value.content"
    />
    <v-alert
      v-else-if="value.type === 'alert' && value.content"
      :type="value.alertType"
      border="left"
      text
    >
      <div v-html="value.content" />
    </v-alert>
    <div
      v-else-if="value.type === 'divider'"
      class="my-6"
    >
      <v-divider />
    </div>
    <dataset-card
      v-else-if="value.type === 'datasetCard'"
      :dataset="resolvedDataset"
    />
    <v-card
      v-else-if="value.type === 'card'"
      class="my-6 also-outlined"
      :elevation="elevation"
    >
      <v-card-text>
        <k-element
          v-for="(element, i) in value.content"
          :key="i"
          :value="element"
          :images="images"
        />
      </v-card-text>
    </v-card>
    <v-card
      v-else-if="value.type === 'cardSimple'"
      outlined
      class="d-flex flex-column fill-height"
    >
      <v-row
        v-if="value.icon && value.centerTitle !== false"
        class="justify-center mt-2"
      >
        <v-icon :class="cardTitleClass">
          mdi-{{ value.icon.name }}
        </v-icon>
      </v-row>
      <v-card-title
        :class="cardTitleClass"
        :style="{'text-align': value.centerTitle !== false ? 'center' : 'left'}"
      >
        <v-icon
          v-if="value.icon && value.centerTitle === false"
          :class="cardTitleClass"
        >
          mdi-{{ value.icon.name }}
        </v-icon>
        {{ value.title }}
      </v-card-title>
      <v-card-text
        v-if="value.content"
        :style="{'overflow-wrap': 'break-word', 'text-align': value.centerContent ? 'center' : 'left'}"
        :class="{ 'text-body-1': true, 'px-8': value.centerContent, 'pb-8': value.centerContent}"
        v-html="value.content"
      />
      <v-spacer />
      <v-card-actions
        v-if="value.actions && value.actions.length"
        class="mb-2 justify-center "
      >
        <k-element
          v-for="(action, i) in value.actions"
          :key="i"
          :value="action"
          :images="images"
        />
      </v-card-actions>
    </v-card>
    <v-btn
      v-else-if="value.type === 'button' && value.href"
      :href="value.href"
      outlined
      color="primary"
    >
      <v-icon
        v-if="value.icon"
        left
      >
        mdi-{{ value.icon.name }}
      </v-icon>
      {{ value.label }}
    </v-btn>
    <v-row
      v-if="value.type === 'twoColumns'"
      class="mb-6"
    >
      <v-col
        :cols="12"
        :md="value.layout === 'left' ? 8 : (value.layout === 'right' ? 4 : 6)"
      >
        <k-element
          v-for="(lElement, li) in value.leftColumn"
          :key="`l${li}`"
          :value="lElement"
          :images="images"
        />
      </v-col>
      <v-col
        :cols="12"
        :md="value.layout === 'left' ? 4 : (value.layout === 'right' ? 8 : 6)"
      >
        <k-element
          v-for="(rElement, ri) in value.rightColumn"
          :key="`r${ri}`"
          :value="rElement"
          :images="images"
        />
      </v-col>
    </v-row>
    <v-row
      v-else-if="value.type === 'responsiveFlow'"
      class="mb-6"
    >
      <v-col
        v-for="(lElement, li) in value.items"
        :key="`l${li}`"
        :cols="12"
        :sm="6"
        :md="4"
      >
        <v-card
          v-if="value.card === true"
          class="also-outlined"
          :elevation="elevation"
        >
          <v-card-text>
            <k-element
              :value="lElement"
              :images="images"
            />
          </v-card-text>
        </v-card>
        <k-element
          v-else
          :value="lElement"
          :images="images"
        />
      </v-col>
    </v-row>
    <client-only v-else>
      <v-iframe
        v-if="value.type === 'datasetForm' && value.dataset"
        :src="formIframeSrc(value.dataset)"
      />
      <v-iframe
        v-else-if="value.type === 'datasetTable' && value.dataset"
        scrolling="yes"
        :iframe-resizer="false"
        :src="tableIframeSrc(value.dataset)"
      />
      <v-iframe
        v-else-if="value.type === 'application' && value.application"
        :src="applicationIframeSrc(value.application)"
      />
      <template v-else-if="value.type === 'image' && (value.url || (value.local && value.local.attachmentPath))">
        <a
          v-if="value.href && (value.href.startsWith('http://') || value.href.startsWith('https://'))"
          :href="value.href"
          target="_blank"
        >
          <v-img
            :style="value.height ? `height:${value.height}px` : ''"
            :contain="!!value.height"
            :src="value.url || (images && images[value.local.assetId]) || `${imagesDatasetUrl}/attachments/${value.local.attachmentPath}`"
            :title="value.title"
          />
        </a>
        <v-img
          v-else
          :style="value.height ? `height:${value.height}px` : ''"
          :contain="!!value.height"
          :src="value.url || (images && images[value.local.assetId]) || `${imagesDatasetUrl}/attachments/${value.local.attachmentPath}`"
          :title="value.title"
        />
      </template>
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
const { mapState, mapGetters } = require('vuex')

export default {
  name: 'KElement',
  components: { VIframe, DatasetCard },
  props: ['value', 'images'],
  data () {
    return {
      loading: false,
      resolvedDataset: null,
      error: null
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['readablePrimaryColor', 'elevation', 'imagesDatasetUrl']),
    titleClass () {
      if (!this.value || this.value.type !== 'title') return null
      const margins = {
        h6: '2',
        h3: '6',
        h1: '8'
      }
      let res = `text-${this.value.titleSize || 'h3'} my-${margins[this.value.titleSize] || '4'}`
      if (this.value.colored) res += ' primary--text'
      return res
    },
    cardTitleClass () {
      if (!this.value || this.value.type !== 'cardSimple') return
      return `primary--text ${this.value.centerTitle ? 'justify-center' : ''} text-${this.value.titleSize || 'h6'}`
    }
  },
  watch: {
    'value.dataset' () {
      this.resolveDataset()
    }
  },
  async created () {
    await this.resolveDataset()
  },
  methods: {
    tableIframeSrc (dataset) {
      return `${this.$store.getters.dataFairUrl}/embed/dataset/${dataset.id}${process.env.tablePreviewPath}?primary=${encodeURIComponent(this.config.themeColor)}`
    },
    formIframeSrc (dataset) {
      return `${this.$store.getters.dataFairUrl}/embed/dataset/${dataset.id}/form?primary=${encodeURIComponent(this.config.themeColor)}`
    },
    applicationIframeSrc (application) {
      return `${this.$store.getters.dataFairUrl}/app/${application.id}?embed=true&primary=${encodeURIComponent(this.readablePrimaryColor)}`
    },
    async resolveDataset () {
      this.error = null
      if (this.value.type === 'datasetCard' && this.value.dataset) {
        this.loading = true
        try {
          this.resolvedDataset = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.value.dataset.id, { params: { html: true } })
        } catch (err) {
          this.resolvedDataset = null
          this.error = err.message
        }
        this.loading = false
      } else this.resolvedDataset = null
    },
    isValidUrl (url) {
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
    }
  }
}
</script>

<style lang="css">
.page-element p:last-child {
  margin-bottom: 0;
}
</style>
