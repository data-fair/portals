<template>
  <div>
    <v-progress-linear v-if="!config" indeterminate />
    <nuxt-child v-if="config" />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    layout: 'manager',
    middleware: 'admin-required',
    async fetch({ store, route }) {
      await store.dispatch('fetchPortalInfos', route.params.portalId)
      await store.dispatch('fetchConfig', route.params.portalId)
    },
    computed: {
      ...mapState(['config']),
    },
  }
</script>
