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
        <!--<v-toolbar-title>Documentation de l'API du catalogue</v-toolbar-title>-->
        <v-spacer />
        <v-btn
          icon
          @click.native="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <client-only>
        <d-frame-wrapper
          :src="`${openapiViewerUrl}/?urlType=catalog`"
          iframe-title="Documentation de l'API du catalogue"
        />
      </client-only>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
  props: ['color'],
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState(['portal']),
    ...mapGetters(['openapiViewerUrl'])
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? '/catalog/api-dialog' : this.$route.path
      if (this.$ma) this.$ma.trackView({ viewName })
    }
  }
}

</script>
