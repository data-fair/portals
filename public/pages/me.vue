<template lang="html">
  <v-container
    v-if="user"
    style="max-width:640px;"
  >
    <client-only>
      <v-iframe :src="sdUrl" />

      <h2 class="text-h5 my-3 ml-3">
        Mes notifications
      </h2>
      <v-iframe
        v-if="notifUrl"
        :src="notifUrl"
      />

      <h2 class="text-h5 my-3 ml-3">
        Mes clés d'API
      </h2>
      <v-iframe :src="apiKeysUrl" />
    </client-only>
  </v-container>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { VIframe },
  layout: 'default',
  middleware: 'portal-required',
  data () {
    return { topics: null }
  },
  computed: {
    ...mapState(['config', 'publicBaseUrl', 'portal']),
    ...mapGetters(['owner', 'directoryUrl', 'notifyUrl', 'dataFairUrl']),
    ...mapState('session', ['user']),
    ...mapGetters('session', ['activeAccount']),
    sdUrl () {
      return `${this.directoryUrl}/me?embed=true&primary=${encodeURIComponent(this.config.themeColor)}&fluid=true`
    },
    apiKeysUrl () {
      return `${this.dataFairUrl}/embed/settings/user/${this.user.id}/api-keys?primary=${encodeURIComponent(this.config.themeColor)}`
    },
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
    if (!this.user) return this.$router.push('/')
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
