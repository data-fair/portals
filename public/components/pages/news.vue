<template>
  <div v-if="config">
    <v-container>
      <k-element
        v-if="config.title"
        :value="{type: 'title', content: config.title}"
      />
      <p
        v-if="config.summary"
        class="font-weight-bold text-h6"
      >
        {{ config.summary }}
      </p>
      <p class="text-caption">
        Publiée le {{ page.publishedAt | date('L') }} par {{ page.created.name }}
      </p>
      <v-img
        v-if="config.mainImage && config.mainImage.attachmentPath"
        :src="(images && images[config.mainImage.assetId]) || `${imagesDatasetUrl}/attachments/${config.mainImage.attachmentPath}`"
        :alt="config.title"
        position=" left center"
        max-height="300px"
        class="my-3"
        contain
      />
      <k-element
        v-if="config.description"
        :value="{type: 'text', content: config.description}"
      />
      <div
        v-for="(block, i) in (config.blocks || []).filter(e => e)"
        :key="i"
      >
        <v-divider class="my-6" />
        <v-row>
          <v-col
            :cols="12"
            :md="block.application ? 6 : 12"
          >
            <k-element
              v-if="block.title"
              :value="{type: 'title', content: block.title}"
            />
            <k-element
              v-if="block.description"
              :value="{type: 'text', content: block.description}"
            />
            <k-element
              v-if="block.alert"
              :value="{type: 'alert', ...block.alert}"
            />
          </v-col>
          <v-col
            v-if="block.application"
            :cols="12"
            :md="6"
          >
            <k-element
              :value="{type: 'application', application: block.application}"
            />
          </v-col>
        </v-row>
        <h3 v-if="block.datasets && block.datasets.length">
          Jeux de données associés
        </h3>
        <v-row v-if="block.datasets">
          <v-col
            v-for="(dataset, li) in block.datasets"
            :key="`${i}l${li}`"
            :cols="12"
            :sm="6"
            :md="4"
          >
            <k-element
              :value="{type: 'datasetCard', ...dataset}"
            />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script>
import KElement from '~/components/pages/element.vue'
import { mapGetters } from 'vuex'
export default {
  components: { KElement },
  props: ['page', 'images'],
  computed: {
    ...mapGetters(['elevation', 'imagesDatasetUrl']),
    config () {
      return this.page.config
    }
  }
}
</script>

<style lang="css"></style>
