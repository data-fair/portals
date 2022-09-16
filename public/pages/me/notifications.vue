<template lang="html">
  <v-container style="max-width:640px;">
    <h2 class="text-h4 my-4 ml-3">
      <v-icon
        size="36"
        color="primary"
        style="top: -2px"
      >
        mdi-bell-circle
      </v-icon> Mes notifications
    </h2>
    <p class="mt-6">
      Vous pouvez configurer ici des notifications globales sur ce portail de données.
    </p>
    <v-alert
      type="info"
      outlined
    >
      Pour des notifications ciblées sur des jeux de données visitez leurs pages individuelles et cliquez sur la cloche.
    </v-alert>
    <v-iframe
      v-if="notifUrl"
      :src="notifUrl"
    />
    <!-- TODO: configure this page to perfectly suit our needs
      <v-iframe
      :src="`${notifyUrl}/embed/subscriptions`"
    />-->
  </v-container>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { VIframe },
  layout: 'personal',
  middleware: 'portal-required',
  data () {
    return { topics: null }
  },
  computed: {
    ...mapState(['config', 'publicBaseUrl', 'portal']),
    ...mapGetters(['owner', 'directoryUrl', 'notifyUrl', 'dataFairUrl']),
    ...mapGetters('session', ['activeAccount']),
    notifUrl () {
      if (!this.topics) return
      const portalTitle = this.config.title || new URL(window.location.href).host
      const keys = [`data-fair:dataset-published:data-fair-portals:${this.portal._id}`]
      const titles = ['Nouveau jeu de données sur ' + portalTitle]
      for (const topic of this.topics) {
        keys.push(`data-fair:dataset-published-topic:data-fair-portals:${this.portal._id}:${topic.id}`)
        titles.push(`Nouveau jeu de données dans la thématique ${topic.title} sur ${portalTitle}`)
      }
      const icon = `${this.directoryUrl}/api/avatars/${this.config.owner.type}/${this.config.owner.id}/avatar.png`
      const urlTemplate = `${this.publicBaseUrl}/datasets/{id}`
      const sender = `${this.config.owner.type}:${this.config.owner.id}`
      return `${this.notifyUrl}/embed/subscribe?primary=${encodeURIComponent(this.config.themeColor)}&key=${encodeURIComponent(keys.join(','))}&title=${encodeURIComponent(titles.join(','))}&icon=${encodeURIComponent(icon)}&url-template=${encodeURIComponent(urlTemplate)}&register=false&sender=${encodeURIComponent(sender)}&outputs=auto`
    }
  },
  async mounted () {
    const params = {
      facets: 'topics',
      owner: this.owner,
      publicationSites: 'data-fair-portals:' + this.portal._id,
      size: 0
    }
    if (this.config.authentication === 'none') params.visibility = 'public'
    const datasets = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets', { params })
    this.topics = datasets.facets.topics.map(t => t.value)
  }
}
</script>
