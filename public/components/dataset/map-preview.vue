<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        :fab="fab"
        :icon="!fab"
        :text="!fab"
        v-on="{...on, click: () => dialog = true}"
      >
        <v-icon :color="color || 'primary'">
          mdi-map-marker
        </v-icon>
      </v-btn>
    </template>
    <span>Carte générique</span>
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
              :id="'map-dataset-' + dataset.id"
              :src="iframeSrc"
              height="100%"
              width="100%"
            />
          </div>
        </v-responsive>
      </v-card>
    </v-dialog>
  </v-tooltip>
</template>

<script>
  const { mapState } = require('vuex')

  export default {
    props: ['dataset', 'color', 'fab'],
    data() {
      return {
        dialog: null,
      }
    },
    computed: {
      ...mapState(['config']),
      iframeSrc() {
        return `${process.env.dataFairUrl}/embed/dataset/${this.dataset.id}/map?primary=${encodeURIComponent(this.config.themeColor)}`
      },
    },
    watch: {
      dialog() {
        const viewName = this.dialog ? `/datasets/${this.dataset.id}/map-dialog` : this.$route.path
        if (this.$ma) this.$ma.trackView({ viewName })
        else console.log('No analytics, track dialog view', viewName)
      },
    },
  }

</script>
