<template>
  <v-menu
    v-model="dialog"
    width="500"
  >
    <template #activator="{ on }">
      <v-btn
        color="success"
        icon
        title="soumettre pour publication"
        :disabled="disabled"
        v-on="on"
        @click="open"
      >
        <v-icon>
          mdi-share
        </v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="title">
        Soumission d'une réutilisation
      </v-card-title>

      <v-card-text>
        <p>
          Voulez vous vraiment soumettre la réutilisation <span
            v-if="title"
            class="accent--text"
          >{{ title }}</span> ?
        </p>
        <p>Une fois la soumission effectuée vous ne pourrez plus éditer ces informations.</p>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click.native="dialog = false"
        >
          Annuler
        </v-btn>
        <v-btn
          color="success"
          @click.native="$emit('submitted');dialog = false"
        >
          Oui
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  props: {
    title: { type: String, default: null },
    disabled: { type: Boolean, default: false }
  },
  data: () => ({
    dialog: false
  }),
  methods: {
    open (e) {
      this.dialog = true
      e.stopPropagation()
    }
  }
}
</script>
