<template>
  <div v-if="page && page.config">
    <v-container :fluid="page.width === 'full'">
      <template v-if="pageConfig">
        <v-form
          v-if="schema && currentEdit === 'title'"
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
        <v-hover
          v-else
          v-slot="{ hover }"
        >
          <div
            :style="(hover && page.config.title ? 'border:solid 1px;margin:-1px;' : '') + 'position:relative'"
          >
            <v-btn
              v-show="hover"
              color="primary"
              fab
              absolute
              :style="`right:${savedConfig.title ? 48 : 16}px`"
              x-small
              @click="localUpdate = savedConfig.title || ''; currentEdit = 'title'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="savedConfig.title"
              v-show="hover"
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
              :value="{ type: 'title', content: page.config.title }"
            />
            <v-alert
              v-else
              class="text-center"
              outlined
            >
              Pas de titre
            </v-alert>
          </div>
        </v-hover>
      </template>
      <k-element
        v-else-if="page.config.title"
        :value="{ type: 'title', content: page.config.title }"
      />
      <template v-if="pageConfig">
        <v-form
          v-if="schema && currentEdit === 'summary'"
          class="pa-1"
          style="border:solid 1px"
        >
          <lazy-v-jsf
            v-model="localUpdate"
            :schema="schema.properties.summary"
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
              @click="$emit('change', { summary: localUpdate }); currentEdit = null"
            >
              Valider
            </v-btn>
            <v-spacer />
          </v-row>
        </v-form>
        <v-hover
          v-else
          v-slot="{ hover }"
        >
          <div
            :style="(hover && page.config.summary ? 'border:solid 1px;margin:-1px;' : '') + 'position:relative'"
          >
            <v-btn
              v-show="hover"
              color="primary"
              fab
              absolute
              :style="`right:${savedConfig.summary ? 48 : 16}px`"
              x-small
              @click="localUpdate = savedConfig.summary || ''; currentEdit = 'summary'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="savedConfig.summary"
              v-show="hover"
              color="warning"
              fab
              absolute
              right
              x-small
              @click="$emit('change', { summary: undefined });"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <p
              v-if="page.config.summary"
              class="font-weight-bold text-h6"
            >
              {{ page.config.summary }}
            </p>
            <v-alert
              v-else
              class="text-center"
              outlined
            >
              Pas de résumé
            </v-alert>
          </div>
        </v-hover>
      </template>
      <p
        v-else-if="page.config.summary"
        class="font-weight-bold text-h6"
      >
        {{ page.config.summary }}
      </p>
      <p class="text-caption">
        Publiée le {{ page.publishedAt | date('L') }} par {{ page.created.name }}
      </p>
      <template v-if="pageConfig">
        <v-form
          v-if="schema && currentEdit === 'mainImage'"
          class="pa-1"
          style="border:solid 1px"
        >
          <lazy-v-jsf
            v-model="localUpdate"
            :schema="schema.properties.mainImage"
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
              @click="$emit('change', { mainImage: localUpdate }); currentEdit = null"
            >
              Valider
            </v-btn>
            <v-spacer />
          </v-row>
        </v-form>
        <v-hover
          v-else
          v-slot="{ hover }"
        >
          <div
            :style="(hover && page.config.mainImage && page.config.mainImage.attachmentPath ? 'border:solid 1px;margin:-13px -1px -1px;' : '') + 'position:relative'"
          >
            <v-btn
              v-show="hover"
              color="primary"
              fab
              absolute
              :style="`right:${savedConfig.mainImage ? 48 : 16}px`"
              x-small
              @click="localUpdate = savedConfig.mainImage; currentEdit = 'mainImage'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="savedConfig.mainImage"
              v-show="hover"
              color="warning"
              fab
              absolute
              right
              x-small
              @click="$emit('change', { mainImage: undefined });"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-img
              v-if="page.config.mainImage && page.config.mainImage.attachmentPath"
              :src="(images && images[page.config.mainImage.assetId]) || `${imagesDatasetUrl}/attachments/${page.config.mainImage.attachmentPath}`"
              :alt="page.config.title"
              position="left center"
              max-height="300px"
              class="my-3"
              contain
            />
            <v-alert
              v-else
              class="text-center"
              outlined
            >
              Pas d'image
            </v-alert>
          </div>
        </v-hover>
      </template>
      <v-img
        v-else-if="page.config.mainImage && page.config.mainImage.attachmentPath"
        :src="(images && images[page.config.mainImage.assetId]) || `${imagesDatasetUrl}/attachments/${page.config.mainImage.attachmentPath}`"
        :alt="page.config.title"
        position="left center"
        max-height="300px"
        class="my-3"
        contain
      />
      <template v-if="pageConfig">
        <v-form
          v-if="schema && currentEdit === 'description'"
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
        <v-hover
          v-else
          v-slot="{ hover }"
        >
          <div
            :style="(hover && page.config.description ? 'border:solid 1px;margin:-1px;' : '') + 'position:relative'"
          >
            <v-btn
              v-show="hover"
              color="primary"
              fab
              absolute
              :style="`right:${savedConfig.description ? 48 : 16}px`"
              x-small
              @click="localUpdate = savedConfig.description || ''; currentEdit = 'description'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="savedConfig.description"
              v-show="hover"
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
              v-else
              class="text-center"
              outlined
            >
              Pas de description
            </v-alert>
          </div>
        </v-hover>
      </template>
      <k-element
        v-else-if="page.config.description"
        :value="{ type: 'text', content: page.config.description }"
      />
      <div
        v-for="(block, i) in (page.config.blocks || []).filter(e => e)"
        :key="i"
      >
        <template v-if="pageConfig">
          <v-form
            v-if="schema && currentEdit === ('element-' + i)"
            class="text-center pa-1"
            style="border:solid 1px"
          >
            <lazy-v-jsf
              v-model="localUpdate"
              :schema="schema.properties.blocks.items"
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
                @click="$emit('change', { blocks: [...savedConfig.blocks.slice(0, i), localUpdate, ...savedConfig.blocks.slice(i + 1)] }); currentEdit = null"
              >
                Valider
              </v-btn>
              <v-spacer />
            </v-row>
          </v-form>
          <v-hover
            v-else
            v-slot="{ hover }"
          >
            <div
              :style="(hover ? 'border:solid 1px;margin:-1px;' : '') + 'position:relative'"
            >
              <v-btn
                v-show="hover"
                :key="'b' + i"
                color="primary"
                fab
                absolute
                style="right:48px"
                x-small
                @click="localUpdate = savedConfig.blocks[i]; currentEdit = ('element-' + i)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-menu
                :key="'sd' + i"
                offset-y
                left
              >
                <template #activator="{ on }">
                  <v-btn
                    v-show="hover"
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
                    @click="$emit('change', { blocks: [...savedConfig.blocks.slice(0, i - 1), savedConfig.blocks[i], savedConfig.blocks[i - 1], ...savedConfig.blocks.slice(i + 1)] }); currentEdit = null"
                  >
                    <v-list-item-avatar :size="24">
                      <v-icon>mdi-menu-up</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>Monter</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="i === savedConfig.blocks.length - 1"
                    @click="$emit('change', { blocks: [...savedConfig.blocks.slice(0, i), savedConfig.blocks[i + 1], savedConfig.blocks[i], ...savedConfig.blocks.slice(i + 2)] }); currentEdit = null"
                  >
                    <v-list-item-avatar :size="24">
                      <v-icon>mdi-menu-down</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>Descendre</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="$emit('change', { blocks: [...savedConfig.blocks.slice(0, i), savedConfig.blocks[i], savedConfig.blocks[i], ...savedConfig.blocks.slice(i + 1)] }); currentEdit = null">
                    <v-list-item-avatar :size="24">
                      <v-icon color="warning">
                        mdi-content-copy
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>Dupliquer</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="$emit('change', { blocks: [...savedConfig.blocks.slice(0, i), ...savedConfig.blocks.slice(i + 1)] }); currentEdit = null">
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
                <v-row>
                  <v-col
                    v-if="block.asset && i%2===1"
                    :cols="12"
                    :md="6"
                  >
                    <k-element
                      :value="block.asset"
                    />
                  </v-col>
                  <v-col
                    :cols="12"
                    :md="block.asset ? 6 : 12"
                  >
                    <k-element
                      v-if="block.title"
                      :value="{ type: 'title', content: block.title, titleSize: 'h4' }"
                    />
                    <k-element
                      v-if="block.description"
                      :value="{ type: 'text', content: block.description }"
                    />
                  </v-col>
                  <v-col
                    v-if="block.asset && i % 2 === 0"
                    :cols="12"
                    :md="6"
                  >
                    <k-element
                      :value="block.asset"
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
                      :value="{ type: 'datasetCard', ...dataset }"
                    />
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-hover>
        </template>
        <div v-else>
          <v-divider class="my-6" />
          <v-row>
            <v-col
              v-if="block.asset && i%2 === 1"
              :cols="12"
              :md="6"
            >
              <k-element
                :value="block.asset"
              />
            </v-col>
            <v-col
              :cols="12"
              :md="block.asset ? 6 : 12"
            >
              <k-element
                v-if="block.title"
                :value="{ type: 'title', content: block.title, titleSize: 'h4' }"
              />
              <k-element
                v-if="block.description"
                :value="{ type: 'text', content: block.description }"
              />
            </v-col>
            <v-col
              v-if="block.asset && i % 2 === 0"
              :cols="12"
              :md="6"
            >
              <k-element
                :value="block.asset"
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
                :value="{ type: 'datasetCard', ...dataset }"
              />
            </v-col>
          </v-row>
        </div>
      </div>
      <v-btn
        v-if="pageConfig && currentEdit === null"
        color="primary"
        fab
        @click="$emit('change', { blocks: [...savedConfig.blocks, {}] }); currentEdit = ('element-' + savedConfig.blocks.length); localUpdate = {}"
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
const schema = require('~/assets/templates/news.json')

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
      config.blocks = config.blocks || []
      return config
    }
  },
  async mounted () {
    this.schema = await $RefParser.dereference(schema)
  }
}
</script>

<style lang="css"></style>
