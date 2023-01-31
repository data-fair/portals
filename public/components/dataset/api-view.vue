<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <action-icon
        title="Documentation de l'API"
        icon=" mdi-cog"
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
          :title="'Documentation de l\'API du jeu de données : ' + dataset.title"
          :src="`${openapiViewerUrl}/?proxy=false&hide-toolbar=true&url=${dataFairUrl}/api/v1/datasets/${dataset.id}/api-docs.json`"
        />
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
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapGetters(['dataFairUrl', 'openapiViewerUrl'])
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? `/datasets/${this.dataset.id}/api-dialog` : this.$route.path
      this.$ma.trackView({ viewName })
    }
  }
}

</script>
