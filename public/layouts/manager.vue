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
import 'iframe-resizer/js/iframeResizer.contentWindow'

global.iFrameResizer = {
  heightCalculationMethod: 'taggedElement'
}

export default {
  components: { ManagerTop },
  middleware: 'breadcrumbs',
  computed: {
    ...mapGetters(['embed'])
  }
}

</script>

<style>
</style>
