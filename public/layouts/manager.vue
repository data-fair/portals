<template>
  <v-app>
    <client-only><manager-top v-if="!embed" /></client-only>
    <v-main>
      <nuxt-child />
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import ManagerTop from '~/components/layout/manager-top.vue'

export default {
  components: { ManagerTop },
  computed: {
    ...mapGetters(['embed'])
  },
  created () {
  }
}

</script>

<style>
</style>
