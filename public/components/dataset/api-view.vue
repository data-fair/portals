<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        v-on="{...on, click: () => dialog = true}"
        @click="dialog=true"
      >
        <v-icon :color="color || 'primary'">
          mdi-cog
        </v-icon>
      </v-btn>
    </template>
    <span>Documentation de l'API</span>
    <v-dialog
      v-model="dialog"
      :fullscreen="$vuetify.breakpoint.mdAndDown"
      :max-width="1200"
    >
      <v-card v-if="dialog">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ dataset.title }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click.native="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndUp ? 1.5 : 1.0">
          <div style="width:1px;min-width:100%;height:1px;min-height:100%;">
            <iframe
              :id="'api-dataset-' + dataset.id"
              :src="`${env.openapiViewerUrl}?proxy=false&hide-toolbar=true&url=${env.dataFairUrl}/api/v1/datasets/${dataset.id}/api-docs.json`"
              height="100%"
              width="100%"
              @load="iframeLoaded"
            />/>
          </div>
        </v-responsive>
      </v-card>
    </v-dialog>
  </v-tooltip>
</template>

<script>
import iFrameResize from 'iframe-resizer/js/iframeResizer'
const { mapState } = require('vuex')

export default {
  props: ['dataset', 'color'],
  data() {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState(['env'])
  },
  watch: {
    dialog() {
      const viewName = this.dialog ? `/datasets/${this.dataset.id}/api-dialog` : this.$route.path
      if (this.$ma) this.$ma.trackView({ viewName })
      else console.log('No analytics, track dialog view', viewName)
    }
  },
  methods: {
    iframeLoaded () {
      iFrameResize({ log: false }, '#api-dataset--' + this.dataset.id)
    }
  }
}

</script>
