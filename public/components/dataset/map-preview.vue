<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <v-btn
        v-if="config.datasetActionsDisplay === 'button'"
        text
        x-small
        color="primary"
        v-on="onDialog"
      >
        <v-icon small>
          mdi-map-marker
        </v-icon>&nbsp;Carte
      </v-btn>
      <action-icon
        v-else
        title="Carte générique"
        icon="mdi-map-marker"
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
          :title="'Vue carte du jeu de données : ' + dataset.title"
          :src="iframeSrc"
          :aspect-ratio="$vuetify.breakpoint.smAndDown ? windowWidth / (windowHeight - 48) : undefined"
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
  props: ['dataset', 'color', 'fab'],
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState(['config']),
    iframeSrc () {
      return `${this.$store.getters.dataFairUrl}${process.env.embeds.map.replace('{id}', this.dataset.id)}?primary=${encodeURIComponent(this.config.themeColor)}`
    }
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? `/datasets/${this.dataset.id}/map-dialog` : this.$route.path
      if (this.$ma) this.$ma.trackView({ viewName })
    }
  }
}

</script>
