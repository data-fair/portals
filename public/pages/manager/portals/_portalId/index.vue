<template lang="html">
  <v-container fluid>
    <v-breadcrumbs :items="breadcrumbItems" large />
    <v-row>
      <v-col
        cols="12"
        sm="5"
        md="4"
        xl="3"
        class="py-0"
      >
        <v-progress-linear v-if="!configDraft" indeterminate />
        <v-form
          v-else
          ref="configForm"
          v-model="formValid"
          @submit="validateDraft"
        >
          <v-jsf
            v-model="configDraft"
            :schema="schema"
            :options="{context}"
          />

          <v-row class="mt-3">
            <v-spacer />

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
                  color="warning"
                  class="ml-2 mr-3"
                  @click="showCancelDialog = true"
                  v-on="on"
                >
                  Réinitialiser
                </v-btn>
              </template>
              <span>Repartir de la version courante du portail pour l'ébauche</span>
            </v-tooltip>
          </v-row>
        </v-form>
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
            <v-tab :key="0">
              ébauche
            </v-tab>
            <v-tab-item :key="0" class="py-1 pl-0 pr-1">
              <v-card
                v-if="showDraft"
                class="pa-0"
                outlined
              >
                <iframe
                  :src="portal.draftLink"
                  :height="`${iframeHeight}px`"
                  width="100%"
                />
              </v-card>
            </v-tab-item>
            <v-tab :key="1">
              version courante
            </v-tab>
            <v-tab-item :key="1">
              <v-card
                class="pa-0"
                outlined
              >
                <iframe
                  v-if="showProdPreview"
                  :src="portal.link"
                  :height="`${iframeHeight}px`"
                  width="100%"
                />
              </v-card>
            </v-tab-item>
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
          <v-btn text @click="showCancelDialog = false">
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

  import debounce from 'debounce'
  import { mapState, mapGetters } from 'vuex'
  import VJsf from '@koumoul/vjsf/lib/VJsf.js'
  import '@koumoul/vjsf/lib/VJsf.css'
  import '@koumoul/vjsf/lib/deps/third-party.js'
  import eventBus from '~/event-bus.js'

  const schema = require('~/../contract/config.json')

  export default {
    components: { VJsf },
    data() {
      return {
        configDraft: null,
        schema,
        formValid: false,
        eventBus,
        showCancelDialog: false,
        showDraft: true,
        showProdPreview: true,
        activeTab: 0,
      }
    },
    computed: {
      ...mapState(['portal']),
      ...mapGetters('session', ['activeAccount']),
      context() {
        return { owner: this.activeAccount.type + ':' + this.activeAccount.id, dataFairUrl: process.env.dataFairUrl }
      },
      iframeHeight() {
        return 800
      },
      breadcrumbItems() {
        return [
          { text: 'Mes portails', to: { name: 'manager-portals' }, disabled: false, exact: true },
          { text: this.portal.title, disabled: true },
          { text: 'Pages', to: { name: 'manager-portals-portalId-pages', params: { portalId: this.portal._id } }, disabled: false, exact: true },
        ]
      },
    },
    watch: {
      configDraft: {
        handler: debounce(function() {
          this.saveDraft()
        }, 200),
        deep: true,
        immediate: false,
      },
    },
    async created() {
      this.fetchConfigDraft()
    },
    methods: {
      async fetchConfigDraft() {
        this.configDraft = await this.$axios.$get(`api/v1/portals/${this.portal._id}/config`, { params: { draft: true } })
      },
      refreshDraftPreview() {
        this.showDraft = false
        setTimeout(() => { this.showDraft = true }, 1)
      },
      refreshProdPreview() {
        this.showProdPreview = false
        setTimeout(() => { this.showProdPreview = true }, 1)
      },
      async saveDraft(e) {
        this.$refs.configForm && this.$refs.configForm.validate()
        if (!this.formValid) return
        this.showDraft = false
        if (this.configDraft.assets) {
          for (const key in this.configDraft.assets) {
            if (this.configDraft.assets[key] && this.configDraft.assets[key].data) {
              await this.uploadAsset(key, this.configDraft.assets[key].data)
              delete this.configDraft.assets[key].data
            }
          }
        }
        await this.$axios.$put(`api/v1/portals/${this.portal._id}/configDraft`, this.configDraft)
        this.showDraft = true
        this.activeTab = 0
      },
      async validateDraft(e) {
        e.preventDefault()
        this.showProd = false
        await this.$axios.$post(`api/v1/portals/${this.portal._id}/_validate_draft`)
        this.showProd = true
        this.activeTab = 1
      },
      async cancelDraft(e) {
        e.preventDefault()
        this.showDraft = false
        await this.$axios.$post(`api/v1/portals/${this.portal._id}/_cancel_draft`)
        this.showDraft = true
        this.activeTab = 0
        this.fetchConfigDraft()
      },
      async uploadAsset(key, file) {
        const formData = new FormData()
        formData.append('asset', file)
        await this.$axios.$post(`api/v1/portals/${this.portal._id}/assets/${key}`, formData,
                                { headers: { 'Content-Type': 'multipart/form-data' } })
      },
    },
  }
</script>
