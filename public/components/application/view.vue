<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <v-tooltip top>
        <template #activator="{ on: onTooltip }">
          <v-btn
            icon
            color="primary"
            v-on="{...onDialog, ...onTooltip}"
          >
            <v-icon>mdi-tooltip-image-outline</v-icon>
          </v-btn>
        </template>
        <span>Voir la visualisation</span>
      </v-tooltip>
    </template>

    <v-card v-if="dialog">
      <v-toolbar
        dense
        flat
      >
        <v-toolbar-title>{{ application.title }}</v-toolbar-title>
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
          :id="'application-' + application.id"
          :src="application.exposedUrl + `?embed=true&primary=${encodeURIComponent(readableThemeColor)}`"
        />
      </client-only>
    </v-card>
  </v-dialog>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { VIframe },
  props: ['application'],
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['readableThemeColor'])
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? `/applications/${this.application.id}/application-dialog` : this.$route.path
      this.$ma.trackView({ viewName })
    }
  }
}

</script>
