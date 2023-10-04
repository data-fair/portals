<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <v-btn
        icon
        target="_blank"
        class="ml-2"
        aria-label="Documentation de l'API du catalogue"
        title="Documentation de l'API du catalogue"
        v-on="onDialog"
      >
        <v-icon>
          mdi-cog
        </v-icon>
      </v-btn>
    </template>
    <v-card v-if="dialog">
      <v-toolbar
        dense
        flat
      >
        <v-toolbar-title>Documentation de l'API du catalogue</v-toolbar-title>
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
          title="Documentation de l'API du catalogue"
          :src="`${openapiViewerUrl}/?proxy=false&hide-toolbar=true&url=${encodeURIComponent(apiDocsUrl)}`"
        />
      </client-only>
    </v-card>
  </v-dialog>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
import { mapState, mapGetters } from 'vuex'
export default {
  components: { VIframe },
  props: ['color'],
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState(['portal']),
    ...mapGetters(['dataFairUrl', 'openapiViewerUrl']),
    apiDocsUrl () {
      return `${this.dataFairUrl}/api/v1/catalog/api-docs.json?publicationSites=${encodeURIComponent(`data-fair-portals:${this.portal._id}`)}`
    }
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? '/catalog/api-dialog' : this.$route.path
      if (this.$ma) this.$ma.trackView({ viewName })
    }
  }
}

</script>
