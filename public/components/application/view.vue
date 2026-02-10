<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <v-btn
        v-if="config.applicationActionsDisplay === 'button'"
        text
        x-small
        color="primary"
        v-on="onDialog"
      >
        <v-icon small>
          mdi-tooltip-image-outline
        </v-icon>&nbsp;Aperçu
      </v-btn>
      <action-icon
        v-else
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
        <d-frame-wrapper
          :iframe-title="application.title"
          :src="application.exposedUrl + `?d-frame=true&primary=${encodeURIComponent(readablePrimaryColor)}`"
          aspect-ratio
        />
      </client-only>
    </v-card>
  </v-dialog>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
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
      const viewName = this.dialog ? `/applications/${this.application.slug}/application-dialog` : this.$route.path
      if (this.$ma) this.$ma.trackView({ viewName })
    }
  }
}

</script>
