<template>
  <div
    v-if="page && page.config"
    ref="page"
  >
    <v-form
      v-if="pageConfig && schema && currentEdit === 'banner'"
      class="pa-1"
      style="border:solid 1px"
    >
      <lazy-v-jsf
        v-model="localUpdate"
        :schema="schema.properties.banner"
        :options="vjsfOpts"
      />
      <v-row class="ma-0">
        <v-spacer />
        <v-btn
          color="warning"
          @click="currentEdit = null"
        >
          Annuler
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          @click="$emit('change', { banner: localUpdate }); currentEdit = null"
        >
          Valider
        </v-btn>
        <v-spacer />
      </v-row>
    </v-form>
    <template v-else>
      <v-btn
        v-if="pageConfig"
        color="primary"
        fab
        absolute
        :style="`right:${savedConfig.banner ? 48 : 16}px`"
        x-small
        @click="localUpdate=savedConfig.banner;currentEdit = 'banner'"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        v-if="pageConfig && savedConfig.banner"
        color="warning"
        fab
        absolute
        right
        x-small
        @click="$emit('change', { banner: undefined });"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-img
        v-if="page.config.banner && (page.config.banner.url || page.config.banner.local)"
        :style="'margin-top:-12px;' + (page.config.banner.height ? `height:${page.config.banner.height}px` : '')"
        :src="page.config.banner.url || (images && images[page.config.banner.local.assetId]) || `${imagesDatasetUrl}/attachments/${page.config.banner.local.attachmentPath}`"
        :title="page.config.banner.title"
      />
      <v-alert
        v-else-if="pageConfig"
        class="text-center"
        outlined
      >
        Pas de bannière
      </v-alert>
    </template>
    <v-form
      v-if="pageConfig && schema && currentEdit === 'toc'"
      class="pa-1"
      style="border:solid 1px"
    >
      <lazy-v-jsf
        v-model="localUpdate"
        :schema="schema.properties.toc"
        :options="vjsfOpts"
      />
      <v-row class="ma-0">
        <v-spacer />
        <v-btn
          color="warning"
          @click="currentEdit = null"
        >
          Annuler
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          @click="$emit('change', { toc: localUpdate }); currentEdit = null"
        >
          Valider
        </v-btn>
        <v-spacer />
      </v-row>
    </v-form>
    <template v-else>
      <v-btn
        v-if="pageConfig"
        color="primary"
        fab
        absolute
        :style="`right:${savedConfig.toc ? 48 : 16}px`"
        x-small
        @click="localUpdate = savedConfig.toc; currentEdit = 'toc'"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        v-if="pageConfig && savedConfig.toc"
        color="warning"
        fab
        absolute
        right
        x-small
        @click="$emit('change', { toc: undefined });"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <layout-toc
        v-if="page.config.toc && page.config.toc.display !== 'none'"
        :style="`${page.config.toc.display}:16px;position:fixed`"
        :title="page.config.toc.title && page.config.toc.title.length ? page.config.toc.title : undefined"
        :sections="page.config.elements.map((e, i) => ({ title: e.type === 'title' && e.content, id: 'element' + i })).filter(e => e.title)"
      />

      <v-alert
        v-else-if="pageConfig"
        class="text-center"
        outlined
      >
        Pas de sommaire
      </v-alert>
    </template>
    <v-container>
      <div
        v-for="(element, i) in (page.config.elements || []).filter(e => e)"
        :id="'element'+i"
        :key="i"
      >
        <v-form
          v-if="pageConfig && schema && currentEdit === ('element-'+i)"
          class="text-center pa-1"
          style="border:solid 1px"
        >
          <lazy-v-jsf
            v-model="localUpdate"
            :schema="schema.properties.elements.items"
            :options="vjsfOpts"
          />
          <v-row class="ma-0">
            <v-spacer />
            <v-btn
              color="warning"
              @click="currentEdit = null"
            >
              Annuler
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              @click="$emit('change', { elements: [...savedConfig.elements.slice(0, i), localUpdate,...savedConfig.elements.slice(i+1)] }); currentEdit = null"
            >
              Valider
            </v-btn>
            <v-spacer />
          </v-row>
        </v-form>
        <template v-else>
          <v-btn
            v-if="pageConfig"
            :key="'b'+i"
            color="primary"
            fab
            absolute
            style="right:48px"
            x-small
            @click="localUpdate=savedConfig.elements[i];currentEdit = ('element-' + i)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-menu
            v-if="pageConfig"
            :key="'sd' + i"
            offset-y
            left
          >
            <template #activator="{ on }">
              <v-btn
                fab
                absolute
                right
                x-small
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item
                :disabled="i === 0"
                @click="$emit('change', { elements: [...savedConfig.elements.slice(0, i-1), savedConfig.elements[i], savedConfig.elements[i-1],...savedConfig.elements.slice(i + 1)] }); currentEdit = null"
              >
                <v-list-item-avatar :size="24">
                  <v-icon>mdi-menu-up</v-icon>
                </v-list-item-avatar>
                <v-list-item-title>Monter</v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="i === (savedConfig.elements || []).length-1"
                @click="$emit('change', { elements: [...savedConfig.elements.slice(0, i), savedConfig.elements[i+1], savedConfig.elements[i], ...savedConfig.elements.slice(i + 2)] }); currentEdit = null"
              >
                <v-list-item-avatar :size="24">
                  <v-icon>mdi-menu-down</v-icon>
                </v-list-item-avatar>
                <v-list-item-title>Descendre</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('change', { elements: [...savedConfig.elements.slice(0, i), savedConfig.elements[i], savedConfig.elements[i], ...savedConfig.elements.slice(i + 1)] }); currentEdit = null">
                <v-list-item-avatar :size="24">
                  <v-icon color="warning">
                    mdi-content-copy
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-title>Dupliquer</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('change', { elements: [...savedConfig.elements.slice(0, i), ...savedConfig.elements.slice(i + 1)] }); currentEdit = null">
                <v-list-item-avatar :size="24">
                  <v-icon color="warning">
                    mdi-delete
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-title>Supprimer</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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
            v-else-if="element.type"
            :value="element"
            :images="images"
          />
          <v-alert
            v-else-if="pageConfig"
            class="text-center"
            outlined
          >
            Element non configuré
          </v-alert>
        </template>
      </div>
      <v-btn
        v-if="pageConfig && currentEdit === null"
        color="primary"
        fab
        @click="$emit('change', { elements: [...savedConfig.elements, {}] }); currentEdit = ('element-' + savedConfig.elements.length); localUpdate={}"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-container>
  </div>
</template>

<script>
import KElement from '~/components/pages/element.vue'
import { mapState, mapGetters } from 'vuex'
import $RefParser from '@apidevtools/json-schema-ref-parser'
const schema = require('~/assets/templates/blank.json')

export default {
  components: { KElement },
  props: ['pageConfig', 'images', 'page'],
  data: () => ({
    tabs: {},
    currentEdit: null,
    schema: null,
    localUpdate: null
  }),
  computed: {
    ...mapState(['config']),
    ...mapGetters(['imagesDatasetUrl']),
    dataFairUrl () {
      return this.$store.getters.dataFairUrl
    },
    vjsfOpts () {
      if (!this.pageConfig) return
      const topicsUrl = `${this.dataFairUrl}/api/v1/settings/${this.config.owner.type}/${this.config.owner.id}/topics`
      return {
        context: {
          dataFairUrl: this.dataFairUrl,
          topicsUrl,
          owner: this.config.owner.type + ':' + this.config.owner.id,
          page: {
            id: this.page.id,
            title: this.page.title
          }
        },
        arrayItemCardProps: { outlined: true, tile: true },
        hideReadOnlyEmpty: true,
        hideReadOnlyTooltips: true,
        hideReadOnlyLabels: true,
        readOnlyFieldProps: { dense: true }
      }
    },
    savedConfig () {
      const config = JSON.parse(JSON.stringify(this.pageConfig || {}))
      config.elements = config.elements || []
      return config
    }
  },
  async mounted () {
    this.schema = await $RefParser.dereference(schema)
  }
}
</script>

<style lang="css"></style>
