<template>
  <action-icon
    title="Accéder à la visualisation en plein écran"
    icon="mdi-fullscreen"
    :to="{name: 'applications-ref-full', params:{ref: applicationRef}, query: syncedStateParams}"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    application: { type: Object, required: true },
    syncedState: { type: Object, default: null }
  },
  computed: {
    ...mapGetters(['isPublished']),
    applicationRef () {
      return this.isPublished ? this.application.slug : this.application.id
    },
    syncedStateParams () {
      if (!this.syncedState) return {}
      const url = new URL(this.syncedState.href)
      const params = {}
      for (const key of [...url.searchParams.keys()]) {
        if (key !== 'embed' && key !== 'primary') params[key] = url.searchParams.get(key)
      }
      return params
    }
  }
}
</script>

<style>

</style>
