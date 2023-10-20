<template>
  <div v-if="page && page.config">
    <v-container>
      <v-form
        v-if="pageConfig && schema && currentEdit === 'title'"
        class="pa-1"
        style="border:solid 1px"
      >
        <lazy-v-jsf
          v-model="localUpdate"
          :schema="schema.properties.title"
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
            @click="$emit('change', { title: localUpdate }); currentEdit = null"
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
          :style="`right:${savedConfig.title ? 48 : 16}px`"
          x-small
          @click="localUpdate=savedConfig.title||''; currentEdit = 'title'"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          v-if="pageConfig && savedConfig.title"
          color="warning"
          fab
          absolute
          right
          x-small
          @click="$emit('change', { title: undefined });"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <k-element
          v-if="page.config.title"
          :value="{ type: 'title', content: page.config.title, titleSize: 'h4' }"
        />
        <v-alert
          v-else-if="pageConfig"
          class="text-center"
          outlined
        >
          Pas de titre
        </v-alert>
      </template>
      <v-form
        v-if="pageConfig && schema && currentEdit === 'image'"
        class="pa-1"
        style="border:solid 1px"
      >
        <lazy-v-jsf
          v-model="localUpdate"
          :schema="schema.properties.image"
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
            @click="$emit('change', { image: localUpdate }); currentEdit = null"
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
          :style="`right:${savedConfig.image ? 48 : 16}px`"
          x-small
          @click="localUpdate=savedConfig.image; currentEdit = 'image'"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          v-if="pageConfig && savedConfig.image"
          color="warning"
          fab
          absolute
          right
          x-small
          @click="$emit('change', { image: undefined });"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-img
          v-if="page.config.image && page.config.image.attachmentPath"
          :src="(images && images[page.config.image.assetId]) || `${imagesDatasetUrl}/attachments/${page.config.image.attachmentPath}`"
          :alt="page.config.title"
          position="left center"
          max-height="300px"
          class="my-3"
          contain
        />
        <v-alert
          v-else-if="pageConfig"
          class="text-center"
          outlined
        >
          Pas d'image
        </v-alert>
      </template>
      <v-form
        v-if="pageConfig && schema && currentEdit === 'description'"
        class="pa-1"
        style="border:solid 1px"
      >
        <lazy-v-jsf
          v-model="localUpdate"
          :schema="schema.properties.description"
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
            @click="$emit('change', { description: localUpdate }); currentEdit = null"
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
          :style="`right:${savedConfig.description ? 48 : 16}px`"
          x-small
          @click="localUpdate=savedConfig.description||''; currentEdit = 'description'"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          v-if="pageConfig && savedConfig.description"
          color="warning"
          fab
          absolute
          right
          x-small
          @click="$emit('change', { description: undefined });"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <k-element
          v-if="page.config.description"
          :value="{ type: 'text', content: page.config.description }"
        />
        <v-alert
          v-else-if="pageConfig"
          class="text-center"
          outlined
        >
          Pas de description
        </v-alert>
      </template>
      <events-register
        v-if="!pageConfig"
        :page-id="page.id"
        :page-title="page.title"
      />
      <v-form
        v-if="pageConfig && schema && currentEdit === 'datetimes'"
        class="pa-1"
        style="border:solid 1px"
      >
        <lazy-v-jsf
          v-model="localUpdate"
          :schema="schema.properties.datetimes"
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
            @click="$emit('change', { datetimes: {start: localUpdate.start ? new Date(localUpdate.start) : undefined, end: localUpdate.end ? new Date(localUpdate.end) : undefined } }); currentEdit = null"
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
          :style="`right:${savedConfig.datetimes ? 48 : 16}px`"
          x-small
          @click="localUpdate = savedConfig.datetimes || {}; currentEdit = 'datetimes'"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          v-if="pageConfig && savedConfig.datetimes"
          color="warning"
          fab
          absolute
          right
          x-small
          @click="$emit('change', { datetimes: undefined });"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <div v-if="page.config.datetimes">
          <v-icon>mdi-calendar</v-icon>
          <template v-if="page.config.datetimes.start && page.config.datetimes.end && page.config.datetimes.start.slice(0,10) === page.config.datetimes.end.slice(0, 10)">
            {{ page.config.datetimes.start | date('LL') }}, {{ page.config.datetimes.start | date('LT') }} - {{ page.config.datetimes.end | date('LT') }}
          </template>
          <template v-else>
            {{ page.config.datetimes.start | date('LLL') }} {{ page.config.datetimes.start && page.config.datetimes.end ? '-' : '' }} {{ page.config.datetimes.end | date('LLL') }}
          </template>
        </div>
        <v-alert
          v-else-if="pageConfig"
          class="text-center"
          outlined
        >
          Date et heure inconnues
        </v-alert>
      </template>
      <v-form
        v-if="pageConfig && schema && currentEdit === 'location'"
        class="pa-1"
        style="border:solid 1px"
      >
        <lazy-v-jsf
          v-model="localUpdate"
          :schema="schema.properties.location"
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
            @click="$emit('change', { location: localUpdate }); currentEdit = null"
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
          :style="`right:${savedConfig.location ? 48 : 16}px`"
          x-small
          @click="localUpdate = savedConfig.location || {}; currentEdit = 'location'"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          v-if="pageConfig && savedConfig.location"
          color="warning"
          fab
          absolute
          right
          x-small
          @click="$emit('change', { location: undefined });"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <div v-if="page.config.location">
          <v-icon>mdi-map-marker</v-icon>
          {{ page.config.location.title }}
        </div>
        <v-alert
          v-else-if="pageConfig"
          class="text-center"
          outlined
        >
          Lieu inconnu
        </v-alert>
      </template>
      <div
        v-for="(resource, i) in (page.config.resources || []).filter(e => e)"
        :key="i"
      >
        <v-form
          v-if="pageConfig && schema && currentEdit === ('element-' + i)"
          class="text-center pa-1"
          style="border:solid 1px"
        >
          <lazy-v-jsf
            v-model="localUpdate"
            :schema="schema.properties.resources.items"
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
              @click="$emit('change', { resources: [...savedConfig.resources.slice(0, i), localUpdate, ...savedConfig.resources.slice(i + 1)] }); currentEdit = null"
            >
              Valider
            </v-btn>
            <v-spacer />
          </v-row>
        </v-form>
        <template v-else>
          <v-btn
            v-if="pageConfig"
            :key="'b' + i"
            color="primary"
            fab
            absolute
            style="right:48px"
            x-small
            @click="localUpdate=savedConfig.resources[i]; currentEdit = ('element-' + i)"
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
                @click="$emit('change', { resources: [...savedConfig.resources.slice(0, i - 1), savedConfig.resources[i], savedConfig.resources[i - 1], ...savedConfig.resources.slice(i + 1)] }); currentEdit = null"
              >
                <v-list-item-avatar :size="24">
                  <v-icon>mdi-menu-up</v-icon>
                </v-list-item-avatar>
                <v-list-item-title>Monter</v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="i === savedConfig.resources.length - 1"
                @click="$emit('change', { resources: [...savedConfig.resources.slice(0, i), savedConfig.resources[i + 1], savedConfig.resources[i], ...savedConfig.resources.slice(i + 2)] }); currentEdit = null"
              >
                <v-list-item-avatar :size="24">
                  <v-icon>mdi-menu-down</v-icon>
                </v-list-item-avatar>
                <v-list-item-title>Descendre</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('change', { resources: [...savedConfig.resources.slice(0, i), ...savedConfig.resources.slice(i + 1)] }); currentEdit = null">
                <v-list-item-avatar :size="24">
                  <v-icon color="warning">
                    mdi-delete
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-title>Supprimer</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <div>
            <v-divider class="my-6" />
            <a
              v-if="resource.href && (resource.href.startsWith('http://') || resource.href.startsWith('https://'))"
              :href="resource.href"
              target="_blank"
            >
              <h5>{{ resource.title || resource.href }}</h5>
            </a>
          </div>
        </template>
      </div>
      <v-btn
        v-if="pageConfig && currentEdit === null"
        color="primary"
        small
        @click="$emit('change', { resources: [...savedConfig.resources, {}] }); currentEdit = ('element-' + savedConfig.resources.length); localUpdate = {}"
      >
        <v-icon>mdi-plus</v-icon> Lien Web
      </v-btn>
    </v-container>
  </div>
</template>

<script>
import KElement from '~/components/pages/element.vue'
import { mapState, mapGetters } from 'vuex'
import $RefParser from '@apidevtools/json-schema-ref-parser'
const schema = require('~/assets/templates/event.json')

export default {
  components: { KElement },
  props: ['pageConfig', 'images', 'page'],
  data: () => ({
    currentEdit: null,
    schema: null,
    localUpdate: null
  }),
  computed: {
    ...mapState(['config']),
    ...mapGetters(['elevation', 'imagesDatasetUrl']),
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
      config.resources = config.resources || []
      return config
    }
  },
  async mounted () {
    this.schema = await $RefParser.dereference(schema)
  }
}
</script>

<style lang="css"></style>
