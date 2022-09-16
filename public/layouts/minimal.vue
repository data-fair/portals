<template>
  <v-app class="minimal-layout">
    <layout-dynamic-style />
    <client-only><accept-cookies /></client-only>
    <v-main>
      <nuxt-child />
    </v-main>
  </v-app>
</template>

<script>
import AcceptCookies from '~/components/accept-cookies'

export default {
  components: { AcceptCookies },
  head () {
    return this.$store.getters.portalHead(this.$route)
  }
}

</script>
