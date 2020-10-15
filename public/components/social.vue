<template>
  <div>
    <share-network
      :url="url"
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
      :url="url"
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
      :url="url"
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
      :url="url"
      :title="title"
      network="facebook"
    >
      <v-btn icon>
        <v-icon color="grey darken-2">
          mdi-facebook
        </v-icon>
      </v-btn>
    </share-network>
    <share-network
      v-if="isMobileOnly"
      :url="url"
      network="whatsapp"
    >
      <v-btn icon>
        <v-icon color="grey darken-2">
          mdi-whatsapp
        </v-icon>
      </v-btn>
    </share-network>
  </div>
</template>

<script>
import { isMobileOnly } from 'mobile-device-detect'

export default {
  props: ['url', 'title'],
  data: () => ({
    isMobileOnly
  })
}
</script>

<style lang="css" scoped>
</style>
