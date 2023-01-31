<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <action-icon
        title="Description des champs"
        icon="mdi-view-list"
        v-on="onDialog"
      />
    </template>
    <v-card v-if="dialog">
      <v-toolbar
        dense
        flat
      >
        <v-toolbar-title>{{ dataset.title }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click.native="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <client-only>
        <v-iframe
          :title="'Schéma du jeu de données : ' + dataset.title"
          :src="iframeSrc"
        />
      </client-only>
    </v-card>
  </v-dialog>
</template>

<script>
import VIframe from '@koumoul/v-iframe'
const { mapState } = require('vuex')

export default {
  components: { VIframe },
  props: ['dataset', 'color'],
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState(['config']),
    iframeSrc () {
      return `${this.$store.getters.dataFairUrl}/embed/dataset/${this.dataset.id}/fields?primary=${encodeURIComponent(this.config.themeColor)}`
    }
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? `/datasets/${this.dataset.id}/schema-dialog` : this.$route.path
      this.$ma.trackView({ viewName })
    }
  }
}

</script>
