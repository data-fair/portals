<template>
  <div
    v-if="value"
    :class="`page-element page-element-${value.type}${value.fillHeight ? ' fill-height' : ''}`"
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
    <optional-link
      v-else-if="value.type === 'cardSimple'"
      :href="value.href"
      :title="value.title"
      :class="value.fillHeight ? 'fill-height' : ''"
    >
      <v-card
        v-bind="cardProps"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
      >
        <v-img
          v-if="value.image && (value.image.url || (value.image.local && value.image.local.assetId)) && value.image.position === 'top'"
          :style="value.image.height ? `height:${value.image.height}px` : ''"
          :contain="!!value.image.height"
          :src="value.image.url || (images && images[value.image.local.assetId]) || `${imagesDatasetUrl}/attachments/${value.image.local.attachmentPath}`"
          :title="value.title"
        />
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
          <template v-if="value.icon && value.centerTitle === false">
            <v-icon
              :class="cardTitleClass"
            >
              mdi-{{ value.icon.name }}
            </v-icon>
          &nbsp;
          </template>
          {{ value.title }}
        </v-card-title>
        <v-img
          v-if="value.image && (value.image.url || (value.image.local && value.image.local.assetId)) && value.image.position === 'middle'"
          :style="value.image.height ? `height:${value.image.height}px` : ''"
          :contain="!!value.image.height"
          :src="value.image.url || (images && images[value.image.local.assetId]) || `${imagesDatasetUrl}/attachments/${value.image.local.attachmentPath}`"
          :title="value.title"
        />
        <v-card-text
          v-if="value.content"
          :style="{'overflow-wrap': 'break-word', 'text-align': value.centerContent ? 'center' : 'left'}"
          :class="{ 'text-body-1': true, 'px-8': value.centerContent, 'pb-8': value.centerContent, 'text--primary': true}"
          v-html="value.content"
        />
        <v-img
          v-if="value.image && (value.image.url || (value.image.local && value.image.local.assetId)) && value.image.position === 'bottom'"
          :style="value.image.height ? `height:${value.image.height}px` : ''"
          :contain="!!value.image.height"
          :src="value.image.url || (images && images[value.image.local.assetId]) || `${imagesDatasetUrl}/attachments/${value.image.local.attachmentPath}`"
          :title="value.title"
        />
        <v-spacer />
        <v-card-actions
          v-if="value.actions && value.actions.length"
          class="mb-2 justify-space-around"
        >
          <k-element
            v-for="(action, i) in value.actions"
            :key="i"
            :value="action"
            :images="images"
          />
        </v-card-actions>
      </v-card>
    </optional-link>
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
    <news-last v-else-if="value.type === 'news'" />
    <events v-else-if="value.type === 'events'" />
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
          class="mb-3"
          :style="lElement.fillHeight ? 'height:100%' : ''"
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
          class="mb-3"
          :style="rElement.fillHeight ? 'height:100%' : ''"
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
        :sm="value.large ? 12 : 6"
        :md="value.large ? 6 : 4"
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
      <d-frame-wrapper
        v-if="value.type === 'datasetForm' && value.dataset"
        :src="formIframeSrc(value.dataset)"
        :iframe-title="value.dataset?.title"
        scrolling="no"
        aspect-ratio
      />
      <d-frame-wrapper
        v-else-if="value.type === 'datasetTable' && value.dataset"
        :iframe-title="value.dataset?.title"
        :src="tableIframeSrc()"
        :style="value.fillHeight ? 'height:100%' : ''"
        scrolling="no"
        aspect-ratio
      />
      <d-frame-wrapper
        v-else-if="value.type === 'application' && value.application"
        :style="value.fillHeight ? 'height:100%' : ''"
        :aspect-ratio="!value.fillHeight"
        :src="applicationIframeSrc(value.application)"
        :iframe-title="value.application?.title"
        :sync-state="value.syncState"
        :sync-state-ignore-path="true"
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
          :style="(value.zoomable ? 'cursor:zoom-in;' : '') + (value.height ? `height:${value.height}px` : '')"
          contain
          :src="value.url || (images && images[value.local.assetId]) || `${imagesDatasetUrl}/attachments/${value.local.attachmentPath}`"
          :title="value.title"
          @click="value.zoomable ? overlay= { visible: true, url: value.url || (images && images[value.local.assetId]) || `${imagesDatasetUrl}/attachments/${value.local.attachmentPath}` }: undefined"
        />
        <div
          v-if="value.legend"
          class="text-center caption font-italic"
        >
          {{ value.legend }}
        </div>
      </template>
      <d-frame-wrapper
        v-else-if="value.type === 'iframe' && isValidUrl(value.url)"
        :iframe-title="'Lien vers la page ' + value.url"
        :src="value.url"
      />
      <v-overlay
        :value="overlay.visible"
        style="cursor:zoom-out"
        @click="overlay.visible = false"
      >
        <v-img
          :src="overlay.url"
        />
      </v-overlay>
    </client-only>
  </div>
</template>

<script>
import DatasetCard from '~/components/dataset/card.vue'
const { mapState, mapGetters } = require('vuex')

export default {
  name: 'KElement',
  components: {
    DatasetCard,
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
  props: ['value', 'images'],
  data () {
    return {
      loading: false,
      resolvedDataset: null,
      error: null,
      overlay: { visible: false, url: null },
      hovered: false
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['readablePrimaryColor', 'elevation', 'imagesDatasetUrl', 'isPublished', 'elevation', 'actionCardBackgroundColor']),
    titleClass () {
      if (!this.value || this.value.type !== 'title') return null
      const margins = {
        h6: '2',
        h3: '6',
        h1: '8'
      }
      let res = `text-${this.value.titleSize || 'h3'} my-${margins[this.value.titleSize] || '4'}`
      if (this.value.colored) res += ' primary--text'
      if (this.value.centered) res += ' text-center'
      return res
    },
    cardTitleClass () {
      if (!this.value || this.value.type !== 'cardSimple') return
      let c = `primary--text text-${this.value.titleSize || 'h6'}`
      if (this.value.centerTitle) c += ' justify-center'

      // apply global style from action cards
      if (this.value.href) {
        if (this.hovered && this.config.actionCardOptions.includes('hoverColorTitle')) {
          c += ' primary-darker--text'
        }
        // TODO: this does not work very well
        /* if (this.config.actionCardOptions.includes('hoverUnderlineTitle')) {
          c += ' underline-link underline-link-partial'
          if (this.hovered) c += ' underline-link-hover'
        } */
      }
      return c
    },
    cardProps () {
      const props = {}
      props.class = 'd-flex flex-column'
      if (this.value.fillHeight) {
        props.class += ' fill-height'
      }

      // apply global style from action cards
      if (this.value.href) {
        let outlinedClass = ''

        if (this.config.actionCardOptions.includes('flat') || this.value.flat) props.elevation = 0
        else props.elevation = this.elevation

        if (!this.value.flat) {
          if (this.config.actionCardOptions.includes('outlined')) outlinedClass = 'also-outlined'
          else outlinedClass = 'not-outlined'
        }

        if (this.hovered) {
          if (this.config.actionCardOptions.includes('hoverElevate')) props.elevation = Math.max(this.elevation * 2, 8)
          if (this.config.actionCardOptions.includes('hoverColorBorder')) outlinedClass = 'primary-outlined'
        }
        props.class += ' ' + outlinedClass

        // TODO: what to do abount background ?
        // style: `background-color:${this.layout === 'list' ? 'transparent' : this.actionCardBackgroundColor(this.layout === 'horizontal')}`
      } else {
        if (this.value.flat) {
          props.flat = true
        } else {
          props.outlined = true
        }
      }

      return props
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
    tableIframeSrc () {
      const dataset = this.value.dataset
      const ref = this.isPublished && dataset.slug ? dataset.slug : dataset.id
      let url = `${this.$store.getters.dataFairUrl}${process.env.embeds.table.replace('{id}', ref)}?primary=${encodeURIComponent(this.config.themeColor)}`
      if (this.value.display && this.value.display !== 'auto') {
        url += `&display=${this.value.display}`
      }
      url += `&interaction=${!this.value.noInteractions}`
      if (this.value.fields && this.value.fields.length) { url += '&cols=' + this.value.fields.join(',') }
      return url
    },
    formIframeSrc (dataset) {
      const ref = this.isPublished && dataset.slug ? dataset.slug : dataset.id
      return `${this.$store.getters.dataFairUrl}/embed/dataset/${ref}/form?primary=${encodeURIComponent(this.config.themeColor)}`
    },
    applicationIframeSrc (application) {
      const ref = this.isPublished && application.slug ? application.slug : application.id
      return `${this.$store.getters.dataFairUrl}/app/${ref}?d-frame=true&primary=${encodeURIComponent(this.readablePrimaryColor)}`
    },
    async resolveDataset () {
      this.error = null
      if (this.value.type === 'datasetCard' && this.value.dataset) {
        this.loading = true
        try {
          this.resolvedDataset = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + ((this.isPublished && this.value.dataset.slug) ? this.value.dataset.slug : this.value.dataset.id), { params: { html: true } })
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
