<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    scrollable
    persistent
    max-width="700px"
  >
    <template v-slot:activator="{on}">
      <v-btn
        color="primary" fab small absolute right
        v-on="on"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>

    <v-card v-if="dialog">
      <v-card-title class="title">
        Créer une nouvelle page
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <slot name="form" :valid="valid" :model="editItem">
            <v-jsf v-if="editItem" :schema="schema" :value="editItem" :options="{hideReadOnly: true, context: {}, requiredMessage: 'Information obligatoire', noDataMessage: 'Aucune valeur correspondante', 'searchMessage': 'Recherchez...'}" />
          </slot>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click.native="dialog = false">
          Annuler
        </v-btn>
        <v-btn color="primary" @click.native="confirm">
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import VJsf from '@koumoul/vjsf/lib/VJsf.js'
import '@koumoul/vjsf/lib/deps/third-party.js'
import '@koumoul/vjsf/dist/main.css'

export default {
  components: { VJsf },
  data: () => ({
    schema: require('../../contract/page.json'),
    dialog: false,
    valid: false,
    editItem: {}
  }),
  watch: {
    dialog () {
      if (!this.dialog) {
        this.editItem = {}
      }
    }
  },
  methods: {
    confirm () {
      if (this.$refs.form.validate()) {
        this.$emit('created', this.editItem)
        this.dialog = false
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
