<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        color="primary"
        icon
        v-on="{...on, click: () => dialog = true}"
      >
        <v-icon>mdi-tooltip-image-outline</v-icon>
      </v-btn>
    </template>
    <span>Voir la réutilisation</span>
    <v-dialog
      v-model="dialog"
      :fullscreen="$vuetify.breakpoint.mdAndDown"
      :max-width="1200"
    >
      <v-card v-if="dialog">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ application.title }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click.native="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-iframe :id="'application-' + application.id" :src="application.exposedUrl + `?embed=true&primary=${encodeURIComponent(config.themeColor)}`" />
      </v-card>
    </v-dialog>
  </v-tooltip>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'
  const { mapState } = require('vuex')

  export default {
    components: { VIframe },
    props: ['application'],
    data() {
      return {
        dialog: null,
      }
    },
    computed: {
      ...mapState(['config']),
    },
    watch: {
      dialog() {
        const viewName = this.dialog ? `/reuses/${this.application.id}/application-dialog` : this.$route.path
        if (this.$ma) this.$ma.trackView({ viewName })
        else console.log('No analytics, track dialog view', viewName)
      },
    },
  }

</script>
