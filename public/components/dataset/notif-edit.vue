<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="500"
  >
    <template #activator="{on: onDialog}">
      <action-icon
        title="Notifications"
        icon="mdi-bell"
        :disabled="!user"
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
      <v-card-text class="pa-0">
        <client-only>
          <v-iframe
            :title="'Notifications pour le jeu de données : ' + dataset.title"
            :aspect-ratio="0.1"
            :src="notifUrl"
          />
        </client-only>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { VIframe },
  props: ['dataset', 'color'],
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState(['config', 'publicBaseUrl']),
    ...mapState('session', ['user']),
    ...mapGetters(['owner', 'notifyUrl', 'directoryUrl']),
    notifUrl () {
      const keys = [`data-fair:dataset-data-updated:${this.dataset.id}`, `data-fair:dataset-breaking-change:${this.dataset.id}`]
      const titles = ['mise à jour des données', 'rupture de compatibilité des données']
      const icon = `${this.directoryUrl}/api/avatars/${this.config.owner.type}/${this.config.owner.id}/avatar.png`
      const urlTemplate = `${this.publicBaseUrl}/datasets/${this.dataset.id}`
      const sender = `${this.config.owner.type}:${this.config.owner.id}`
      return `${this.notifyUrl}/embed/subscribe?primary=${encodeURIComponent(this.config.themeColor)}&key=${encodeURIComponent(keys.join(','))}&title=${encodeURIComponent(titles.join(','))}&icon=${encodeURIComponent(icon)}&url-template=${encodeURIComponent(urlTemplate)}&register=false&sender=${encodeURIComponent(sender)}&outputs=auto`
    }
  }
}

</script>
