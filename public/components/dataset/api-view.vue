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
        <v-iframe
          :src="`${openapiViewerUrl}?proxy=false&hide-toolbar=true&url=${dataFairUrl}/api/v1/datasets/${dataset.id}/api-docs.json`"
        />
      </v-card>
    </v-dialog>
  </v-tooltip>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'
  import { mapGetters } from 'vuex'
  export default {
    components: { VIframe },
    props: ['dataset', 'color'],
    data() {
      return {
        dialog: null,
      }
    },
    computed: {
      ...mapGetters(['dataFairUrl', 'openapiViewerUrl']),
    },
    watch: {
      dialog() {
        const viewName = this.dialog ? `/datasets/${this.dataset.id}/api-dialog` : this.$route.path
        if (this.$ma) this.$ma.trackView({ viewName })
        else console.log('No analytics, track dialog view', viewName)
      },
    },
  }

</script>
