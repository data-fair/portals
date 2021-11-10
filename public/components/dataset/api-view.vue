<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.mdAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <v-tooltip top>
        <template v-slot:activator="{ on: onTooltip }">
          <v-btn icon v-on="{...onDialog, ...onTooltip}">
            <v-icon :color="color || 'primary'">
              mdi-cog
            </v-icon>
          </v-btn>
        </template>
        <span>Documentation de l'API</span>
      </v-tooltip>
    </template>
    <v-card v-if="dialog">
      <v-toolbar dense flat>
        <v-toolbar-title>{{ dataset.title }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click.native="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <client-only>
        <v-iframe :src="`${openapiViewerUrl}/?proxy=false&hide-toolbar=true&url=${dataFairUrl}/api/v1/datasets/${dataset.id}/api-docs.json`" />
      </client-only>
    </v-card>
  </v-dialog>
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
        this.$ma.trackView({ viewName })
      },
    },
  }

</script>
