<template lang="html">
  <v-container style="max-width:640px !important;">
    <h2 class="text-h4 my-4 ml-3">
      <v-icon
        size="36"
        color="primary"
        style="top: -2px"
      >
        mdi-share-circle
      </v-icon> Mes réutilisations
    </h2>
    <p class="mt-6">
      Faites connaitre votre utilisation des données de ce portail.
    </p>
    <v-alert
      type="info"
      outlined
    >
      Si vous soumettez une réutilisation votre nom d'utilisateur et votre avatar seront visibles pour les utilisateurs du portail.
    </v-alert>

    <h3 class="text-h5">
      Soumissions précédentes
    </h3>
    <v-row
      v-if="submittedUses && submittedUses.length"
      class="my-3"
    >
      <v-col
        v-for="use of submittedUses"
        :key="use._id"
        md="6"
        cols="12"
      >
        <use-card :use="use" />
      </v-col>
    </v-row>
    <v-row
      v-else-if="submittedUses"
      class="my-6"
    >
      <v-subheader>Vous n'avez pas encore soumis de réutilisation.</v-subheader>
    </v-row>
    <v-row
      v-else
      class="my-6"
    >
      <v-spacer />
      <v-progress-circular
        :size="40"
        :width="5"
        :color="'primary'"
        indeterminate
      />
      <v-spacer />
    </v-row>

    <h3 class="text-h5">
      Brouillons
    </h3>
    <v-row
      v-if="draftUses"
      class="my-3"
    >
      <v-col
        v-for="use of draftUses"
        :key="use._id"
        md="6"
        cols="12"
      >
        <use-card :use="use">
          <template #actions>
            <v-btn
              icon
              title="éditer"
              :disabled="!!editItem"
              @click="editUse(use)"
            >
              <v-icon color="primary">
                mdi-pencil
              </v-icon>
            </v-btn>
            <use-submit-confirm
              :title="use.title"
              :disabled="!!editItem"
              @submitted="submitUse(use)"
            />
            <remove-confirm
              :disabled="!!editItem"
              @removed="deleteUse(use)"
            />
          </template>
        </use-card>
      </v-col>
      <v-col
        align="center"
        class="py-6"
      >
        <v-card
          hover
          class="also-outlined"
          width="90"
          height="90"
          title="créer un nouveau brouillon"
          :disabled="!!editItem"
          @click="newItem"
        >
          <v-icon
            size="90"
            color="primary"
          >
            mdi-plus
          </v-icon>
        </v-card>
      </v-col>
    </v-row>
    <v-row
      v-else
      class="my-6"
    >
      <v-spacer />
      <v-progress-circular
        :size="40"
        :width="5"
        :color="'primary'"
        indeterminate
      />
      <v-spacer />
    </v-row>

    <template v-if="editItem">
      <v-row class="mx-0">
        <v-form
          ref="editForm"
          v-model="validForm"
          class="mt-6"
        >
          <lazy-v-jsf
            v-model="editItem"
            :schema="schema"
            :options="{hideReadOnly: true, deleteReadOnly: true, autofocus: true, fieldProps: {outlined: true, dense: true}}"
          />
        </v-form>
      </v-row>
      <v-row class="mx-0 mb-2">
        <v-spacer />
        <v-btn
          text
          @click="editItem = null"
        >
          annuler
        </v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          @click="save"
        >
          enregistrer
        </v-btn>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
const schema = JSON.parse(JSON.stringify(require('~/../contract/use')))
schema.properties.published.readOnly = true

export default {
  layout: 'personal',
  middleware: 'portal-required',
  data () {
    return {
      validForm: false,
      fullEditItem: null,
      editItem: null,
      schema,
      draftUses: null,
      submittedUses: null,
      saving: false
    }
  },
  computed: {
    ...mapState(['portal'])
  },
  async mounted () {
    await Promise.all([this.fetchDrafts(), this.fetchSubmitted()])
  },
  methods: {
    newItem () {
      this.editItem = {
        title: 'Nouvelle réutilisation'
      }
    },
    async fetchDrafts () {
      this.draftUses = (await this.$axios.$get(`/api/v1/portals/${this.portal._id}/uses`, { params: { owner: 'me', size: 10000 } })).results
    },
    async fetchSubmitted () {
      this.submittedUses = (await this.$axios.$get(`/api/v1/portals/${this.portal._id}/uses`, { params: { creator: 'me', size: 10000 } })).results
    },
    editUse (use) {
      this.fullEditItem = use
      this.editItem = JSON.parse(JSON.stringify(use))
    },
    async save () {
      if (!this.$refs.editForm.validate()) return
      this.saving = true
      const formData = new FormData()
      if (this.editItem.image && this.editItem.image.data) formData.append('image', this.editItem.image.data)
      formData.append('body', JSON.stringify(this.editItem))
      if (this.fullEditItem && this.fullEditItem._id) {
        await this.$axios.$patch(`/api/v1/portals/${this.portal._id}/uses/${this.fullEditItem._id}`, formData)
      } else {
        await this.$axios.$post(`/api/v1/portals/${this.portal._id}/uses`, formData)
      }
      await this.fetchDrafts()
      this.editItem = null
      this.fullEditItem = null
      this.saving = false
    },
    async deleteUse (use) {
      this.saving = true
      await this.$axios.$delete(`/api/v1/portals/${this.portal._id}/uses/${use._id}`)
      await this.fetchDrafts()
      this.saving = false
    },
    async submitUse (use) {
      this.saving = true
      await this.$axios.$post(`/api/v1/portals/${this.portal._id}/uses/${use._id}/_submit`)
      await Promise.all([this.fetchDrafts(), this.fetchSubmitted()])
      this.saving = false
    }
  }
}
</script>
