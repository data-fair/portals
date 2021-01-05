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
        <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndUp ? 1.5 : 1.0">
          <div style="width:1px;min-width:100%;height:1px;min-height:100%;">
            <iframe
              :id="'application-' + application.id"
              :src="application.exposedUrl + '?embed=true'"
              height="100%"
              width="100%"
              @load="iframeLoaded"
            />
          </div>
        </v-responsive>
      </v-card>
    </v-dialog>
  </v-tooltip>
</template>

<script>
  import iFrameResize from 'iframe-resizer/js/iframeResizer'

  export default {
    props: ['application'],
    data() {
      return {
        dialog: null,
      }
    },
    watch: {
      dialog() {
        const viewName = this.dialog ? `/reuses/${this.application.id}/application-dialog` : this.$route.path
        if (this.$ma) this.$ma.trackView({ viewName })
        else console.log('No analytics, track dialog view', viewName)
      },
    },
    methods: {
      iframeLoaded () {
        iFrameResize({ log: false }, '#application-' + this.application.id)
      },
    },
  }

</script>
