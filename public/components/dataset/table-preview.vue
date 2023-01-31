<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1200"
    transition="none"
  >
    <template #activator="{ on: onDialog }">
      <action-icon
        title="Voir le tableau"
        icon="mdi-table-large"
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
          :title="'Vue tableau du jeu de données : ' + dataset.title"
          :src="iframeSrc"
          scrolling="yes"
          :iframe-resizer="false"
          :style="$vuetify.breakpoint.smAndDown ? `height: ${windowHeight - 48}px;` : ''"
          @message="onMessage"
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
      return `${this.$store.getters.dataFairUrl}/embed/dataset/${this.dataset.id}${process.env.tablePreviewPath}?primary=${encodeURIComponent(this.config.themeColor)}&display=${this.$vuetify.breakpoint.smAndDown ? 'list' : 'table'}`
    }
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? `/datasets/${this.dataset.id}/table-dialog` : this.$route.path
      this.$ma.trackView({ viewName })
    }
  },
  methods: {
    // receiving a message from the iframe
    onMessage (message) {
      if (message.trackEvent) this.$ma.trackEvent(message.trackEvent)
    }
  }
}

</script>
