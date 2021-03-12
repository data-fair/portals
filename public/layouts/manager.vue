<template>
  <v-app>
    <client-only><manager-top v-if="!embed" /></client-only>
    <v-main>
      <nuxt-child />
    </v-main>
  </v-app>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer.contentWindow'
  import { mapGetters } from 'vuex'
  import ManagerTop from '~/components/layout/manager-top.vue'
  export default {
    components: { ManagerTop },
    middleware: 'breadcrumbs',
    computed: {
      ...mapGetters(['embed']),
    },
  }

</script>

<style>
.v-list.list-actions .v-list-item .v-list-item__icon {
  margin-right: 16px;
}
</style>
