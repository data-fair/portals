<template lang="html">
  <v-container fluid>
    <v-row class="mt-2">
      <v-col
        cols="12"
        sm="5"
        md="4"
        xl="3"
      >
        <v-progress-linear v-if="!portal" indeterminate />
        <template v-else>
          <v-form
            ref="configForm"
            v-model="formValid"
            @submit="validateDraft"
          >
            <v-jsf
              v-model="portal.configDraft"
              :schema="schema"
              :options="{context}"
            />

            <v-row class="mt-3">
              <v-col class="text-center">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      color="primary"
                      type="submit"
                      v-on="on"
                    >
                      Publier l'ébauche
                    </v-btn>
                  </template>
                  <span>La version courante du portail est mise à jour à partir de l'ébauche</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      color="error"
                      @click="showCancelDialog = true"
                      v-on="on"
                    >
                      Réinitialiser
                    </v-btn>
                  </template>
                  <span>Repartir de la version courante du portail pour l'ébauche</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-form>
        </template>
      </v-col>
      <v-col
        cols="12"
        sm="7"
        md="8"
        xl="9"
        class="pa-0"
      >
        <client-only>
          <v-tabs v-model="activeTab" slider-color="primary">
            <v-tab v-if="portal && hasConfigDraft" :key="0">
              ébauche
            </v-tab>
            <v-tab-item :key="0" class="pa-1">
              <v-card v-if="portal && hasConfigDraft && showDraft" elevation="8">
                <iframe
                  :src="portal.draftLink"
                  :height="`${iframeHeight}px`"
                  width="100%"
                />
              </v-card>
            </v-tab-item>
            <template v-if="portal && portal.config && portal.config.content">
              <v-tab :key="1">
                version courante
              </v-tab>
              <v-tab-item :key="1">
                <v-card elevation="8">
                  <iframe
                    v-if="portal && showProd"
                    :src="portal.link"
                    :height="`${iframeHeight}px`"
                    width="100%"
                  />
                </v-card>
              </v-tab-item>
            </template>
          </v-tabs>
        </client-only>
      </v-col>
    </v-row>

    <v-dialog v-model="showCancelDialog" max-width="500px">
      <v-card>
        <v-card-title primary-title>
          Effacer le brouillon
        </v-card-title>
        <v-card-text>
          <v-alert :value="true" type="error">
            Attention le brouillon sera perdu et l'application reviendra à son état validé précédent.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn flat @click="showCancelDialog = false">
            Annuler
          </v-btn>
          <v-btn color="warning" @click="cancelDraft($event); showCancelDialog = false;">
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

  import { mapGetters } from 'vuex'
  import VJsf from '@koumoul/vjsf/lib/VJsf.js'
  import '@koumoul/vjsf/lib/VJsf.css'
  import '@koumoul/vjsf/lib/deps/third-party.js'
  import eventBus from '~/event-bus.js'

  const schema = require('~/../contract/config.json')

  export default {
    components: { VJsf },
    layout: 'manager',
    data() {
      return {
        portal: null,
        schema,
        formValid: false,
        eventBus,
        showCancelDialog: false,
        showDraft: true,
        showProd: true,
        activeTab: 0,
        tempAssets: {},
        hasConfigDraft: false,
      }
    },
    computed: {
      ...mapGetters('session', ['activeAccount']),
      context() {
        return { owner: this.activeAccount.type + ':' + this.activeAccount.id, dataFairUrl: process.env.dataFairUrl }
      },
      iframeHeight() {
        return 800
      },
    },
    async created() {
      this.fetchPortal()
    },
    methods: {
      async fetchPortal() {
        this.portal = await this.$axios.$get(`api/v1/portals/${this.$route.params.id}`)
        this.hasConfigDraft = !!this.portal.configDraft
        this.portal.configDraft = this.portal.configDraft || {}
      },
      refreshDraftPreview() {
        this.showDraftPreview = false
        setTimeout(() => { this.showDraftPreview = true }, 1)
      },
      refreshProdPreview() {
        this.showProdPreview = false
        setTimeout(() => { this.showProdPreview = true }, 1)
      },
      async saveDraft(e) {
        this.showDraft = false
        await this.$axios.$put(`api/v1/portals/${this.$route.params.id}/configDraft`, this.portal.configDraft)
        this.hasConfigDraft = true
        this.showDraft = true
        this.activeTab = 0
      },
      async validateDraft(e) {
        e.preventDefault()
        this.showProd = false
        await this.$axios.$post(`api/v1/portals/${this.$route.params.id}/_validate_draft`)
        this.showProd = true
        this.activeTab = 1
        this.fetchPortal()
      },
      async cancelDraft(e) {
        e.preventDefault()
        this.showDraft = false
        await this.$axios.$post(`api/v1/portals/${this.$route.params.id}/_cancel_draft`)
        this.showDraft = true
        this.activeTab = 0
        this.fetchPortal()
      },
      handleAsset(asset, e) {
        this.$set(this.tempAssets, asset.key, e.target.files[0])
      },
      async uploadAsset(asset, e) {
        this.showDraft = false
        e.preventDefault()
        const formData = new FormData()
        formData.append('asset', this.tempAssets[asset.key])
        await this.$axios.$post(`api/v1/portals/${this.$route.params.id}/assets/${asset.key}`, formData,
                                { headers: { 'Content-Type': 'multipart/form-data' } })
        this.showDraft = true
      },
    },
  }
</script>
