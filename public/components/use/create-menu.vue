<template>
  <v-menu
    v-model="menu"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    scrollable
    :close-on-click="false"
    :close-on-content-click="false"
    min-width="500px"
    max-width="500px"
  >
    <template #activator="{on, attrs}">
      <v-list-item
        v-bind="attrs"
        v-on="on"
      >
        <v-list-item-icon>
          <v-icon color="primary">
            mdi-plus-circle
          </v-icon>
        </v-list-item-icon>
        <v-list-item-title>Créer une réutilisation</v-list-item-title>
      </v-list-item>
    </template>

    <v-card
      v-if="menu"
      data-iframe-height
    >
      <v-card-title class="title">
        Créer une réutilisation
      </v-card-title>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-text-field
            v-model="editItem.title"
            label="Titre"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click.native="menu = false"
        >
          Annuler
        </v-btn>
        <v-btn
          :disabled="!editItem.title"
          color="primary"
          @click.native="confirm"
        >
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
const newEditItem = { title: 'Nouvelle réutilisation' }
export default {
  data: () => ({
    menu: false,
    valid: false,
    editItem: { ...newEditItem }
  }),
  watch: {
    menu () {
      if (!this.menu) {
        this.editItem = { ...newEditItem }
      }
    }
  },
  methods: {
    confirm () {
      if (this.$refs.form.validate()) {
        this.$emit('created', this.editItem)
        this.menu = false
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
