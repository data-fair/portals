<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        text
        v-on="{...on, click: () => dialog = true}"
      >
        <v-icon :color="color || 'primary'">
          mdi-view-list
        </v-icon>
      </v-btn>
    </template>
    <span>Description des champs</span>
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
        <client-only>
          <v-iframe :src="iframeSrc" />
        </client-only>
      </v-card>
    </v-dialog>
  </v-tooltip>
</template>

<script>
  import VIframe from '@koumoul/v-iframe'
  const { mapState } = require('vuex')

  export default {
    components: { VIframe },
    props: ['dataset', 'color'],
    data() {
      return {
        dialog: null,
      }
    },
    computed: {
      ...mapState(['config']),
      iframeSrc() {
        return `${this.$store.getters.dataFairUrl}/embed/dataset/${this.dataset.id}/fields?primary=${encodeURIComponent(this.config.themeColor)}`
      },
    },
    watch: {
      dialog() {
        const viewName = this.dialog ? `/datasets/${this.dataset.id}/schema-dialog` : this.$route.path
        if (this.$ma) this.$ma.trackView({ viewName })
        else console.log('No analytics, track dialog view', viewName)
      },
    },
  }

</script>
