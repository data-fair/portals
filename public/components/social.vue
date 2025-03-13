<template>
  <div class="share-network">
    <!-- share-network component is provided by vue-social-sharing -->
    <client-only
      v-for="network in networks"
      :key="network.id"
    >
      <share-network
        v-if="!network.mobileOnly || isMobileOnly"
        :url="shareUrl"
        :title="title"
        :network="network.id"
        :aria-label="network.title"
      >
        <action-icon
          :title="network.title"
          :icon="network.icon"
          color="#606060"
        />
      </share-network>
    </client-only>
  </div>
</template>

<script>
import { isMobileOnly } from 'mobile-device-detect'
const { mapState } = require('vuex')

export default {
  props: ['url', 'title'],
  data: () => ({
    isMobileOnly
  }),
  computed: {
    ...mapState(['publicUrl', 'config']),
    shareUrl () {
      return this.url || (this.publicUrl + this.$route.fullPath)
    },
    networks () {
      return [{
        id: 'twitter',
        title: 'Partager sur Twitter',
        icon: 'twitter',
        mobileOnly: false
      }, {
        id: 'bluesky',
        title: 'Partager sur Bluesky',
        icon: 'bluesky',
        mobileOnly: false
      }, {
        id: 'linkedin',
        title: 'Partager sur LinkedIn',
        icon: 'mdi-linkedin',
        mobileOnly: false
      }, {
        id: 'reddit',
        title: 'Partager sur Reddit',
        icon: 'mdi-reddit',
        mobileOnly: false
      }, {
        id: 'facebook',
        title: 'Partager sur Facebook',
        icon: 'mdi-facebook',
        mobileOnly: false
      }, {
        id: 'sms',
        title: 'Partager par SMS',
        icon: 'mdi-message-processing',
        mobileOnly: true
      }, {
        id: 'whatsapp',
        title: 'Partager sur WhatsApp',
        icon: 'mdi-whatsapp',
        mobileOnly: true
      }].filter(n => (this.config.networks || ['twitter', 'linkedin', 'reddit', 'facebook', 'whatsapp']).includes(n.id))
    }
  }
}
</script>
