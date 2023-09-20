<template>
  <div>
    <v-img
      v-if="config.banner && (config.banner.url || config.banner.local)"
      :style="'margin-top:-12px;' + (config.banner.height ? `height:${config.banner.height}px` : '')"
      :src="config.banner.url || (images && images[config.banner.local.assetId]) || `${imagesDatasetUrl}/attachments/${config.banner.local.attachmentPath}`"
      :title="config.banner.title"
    />
    <v-container v-if="config">
      <template v-for="(element, i) in (config.elements || []).filter(e => e)">
        <template v-if="element.type === 'tabs'">
          <v-card
            :key="'t'+i"
            class="mb-6"
          >
            <v-tabs
              v-model="tabs[i]"
              show-arrows
              grow
            >
              <v-tab
                v-for="(tab, j) in element.tabs"
                :key="`t-${i}-${j}`"
                class="font-weight-bold"
              >
                {{ tab.title }}
              </v-tab>
            </v-tabs>
            <v-tabs-items
              :key="'ti'+i"
              v-model="tabs[i]"
            >
              <v-tab-item
                v-for="(tab, j) in element.tabs"
                :key="`ti-${i}-${j}`"
                class="pa-3"
                style="height:100%"
              >
                <k-element
                  v-for="(iElement, k) in tab.elements"
                  :key="`ti-${i}-${j}-${k}`"
                  :value="iElement"
                  :images="images"
                />
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </template>
        <k-element
          v-else
          :key="i"
          :value="element"
          :images="images"
        />
      </template>
    </v-container>
  </div>
</template>

<script>
import KElement from '~/components/pages/element.vue'

export default {
  components: { KElement },
  props: ['config', 'images'],
  data: () => ({
    tabs: {}
  })
}
</script>

<style lang="css"></style>
