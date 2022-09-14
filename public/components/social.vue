<template>
  <div class="share-network">
    <share-network
      :url="shareUrl"
      :title="title"
      network="twitter"
    >
      <v-btn icon>
        <v-icon color="grey darken-2">
          mdi-twitter
        </v-icon>
      </v-btn>
    </share-network>
    <share-network
      :url="shareUrl"
      :title="title"
      network="linkedin"
    >
      <v-btn icon>
        <v-icon color="grey darken-2">
          mdi-linkedin
        </v-icon>
      </v-btn>
    </share-network>
    <share-network
      :url="shareUrl"
      :title="title"
      network="reddit"
    >
      <v-btn icon>
        <v-icon color="grey darken-2">
          mdi-reddit
        </v-icon>
      </v-btn>
    </share-network>
    <share-network
      :url="shareUrl"
      :title="title"
      network="facebook"
    >
      <v-btn icon>
        <v-icon color="grey darken-2">
          mdi-facebook
        </v-icon>
      </v-btn>
    </share-network>
    <client-only>
      <share-network
        v-if="isMobileOnly"
        :url="shareUrl"
        :title="title"
        network="whatsapp"
      >
        <v-btn icon>
          <v-icon color="grey darken-2">
            mdi-whatsapp
          </v-icon>
        </v-btn>
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

<style lang="css" scoped>
.share-network a {
  text-decoration:none;
}
</style>
