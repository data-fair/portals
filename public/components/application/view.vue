<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <action-icon
        title="Voir la visualisation"
        icon="mdi-tooltip-image-outline"
        v-on="onDialog"
      />
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
          :title="application.title"
          :src="application.exposedUrl + `?embed=true&primary=${encodeURIComponent(readablePrimaryColor)}`"
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
    ...mapGetters(['readablePrimaryColor'])
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? `/applications/${this.application.id}/application-dialog` : this.$route.path
      if (this.$ma) this.$ma.trackView({ viewName })
    }
  }
}

</script>
