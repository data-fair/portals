<template>
  <div class="share-network">
    <!-- share-network component is provided by vue-social-sharing -->
    <share-network
      :url="shareUrl"
      :title="title"
      network="twitter"
      aria-label="Partager sur Twitter"
    >
      <action-icon
        title="Partager sur Twitter"
        icon="mdi-twitter"
        color="grey darken-2"
      />
    </share-network>

    <share-network
      :url="shareUrl"
      :title="title"
      network="linkedin"
      aria-label="Partager sur LinkedIn"
    >
      <action-icon
        title="Partager sur LinkedIn"
        icon="mdi-linkedin"
        color="grey darken-2"
      />
    </share-network>
    <share-network
      :url="shareUrl"
      :title="title"
      network="reddit"
      aria-label="Partager sur Reddit"
    >
      <action-icon
        title="Partager sur Reddit"
        icon="mdi-reddit"
        color="grey darken-2"
      />
    </share-network>
    <share-network
      :url="shareUrl"
      :title="title"
      network="facebook"
      aria-label="Partager sur Facebook"
    >
      <action-icon
        title="Partager sur Facebook"
        icon="mdi-facebook"
        color="grey darken-2"
      />
    </share-network>
    <client-only>
      <share-network
        v-if="isMobileOnly"
        :url="shareUrl"
        :title="title"
        network="whatsapp"
        aria-label="Partager sur WhatsApp"
      >
        <action-icon
          title="Partager sur WhatsApp"
          icon="mdi-whatsapp"
          color="grey darken-2"
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
    ...mapState(['publicUrl']),
    shareUrl () {
      return this.url || (this.publicUrl + this.$route.fullPath)
    }
  }
}
</script>
