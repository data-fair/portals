<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="500"
  >
    <template #activator="{on: onDialog}">
      <v-btn
        v-if="config.datasetActionsDisplay === 'button'"
        text
        x-small
        color="primary"
        :disabled="!user"
        v-on="onDialog"
      >
        <v-icon small>
          mdi-bell
        </v-icon>&nbsp;Notifications
      </v-btn>
      <action-icon
        v-else
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
        <d-frame-wrapper
          :iframe-title="'Notifications pour le jeu de données : ' + dataset.title"
          :src="notifUrl"
          scrolling="no"
          aspect-ratio
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
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
      const icon = `${this.directoryUrl}/api/avatars/${this.dataset.owner.type}/${this.dataset.owner.id}/avatar.png`
      const urlTemplate = `${this.publicBaseUrl}/datasets/${this.dataset.id}`
      let sender = `${this.dataset.owner.type}:${this.dataset.owner.id}`
      if (this.dataset.owner.department) sender += ':' + this.dataset.owner.department
      return `${this.notifyUrl}/embed/subscribe?primary=${encodeURIComponent(this.config.themeColor)}&key=${encodeURIComponent(keys.join(','))}&title=${encodeURIComponent(titles.join(','))}&icon=${encodeURIComponent(icon)}&url-template=${encodeURIComponent(urlTemplate)}&register=false&sender=${encodeURIComponent(sender)}&outputs=auto`
    }
  }
}

</script>
