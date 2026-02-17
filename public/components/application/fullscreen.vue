<template>
  <div>
    <v-btn
      v-if="config.applicationActionsDisplay === 'button'"
      text
      x-small
      color="primary"
      :to="{ name: 'applications-ref-full', params: { ref: applicationRef }, query: syncedStateParams }"
    >
      <v-icon small>
        mdi-fullscreen
      </v-icon>&nbsp;Plein écran
    </v-btn>
    <action-icon
      v-else
      title="Accéder à la visualisation en plein écran"
      icon="mdi-fullscreen"
      :to="{name: 'applications-ref-full', params:{ref: applicationRef}, query: syncedStateParams}"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    application: { type: Object, required: true },
    syncedState: { type: Object, default: null }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['isPublished']),
    applicationRef () {
      return this.isPublished ? this.application.slug : this.application.id
    },
    syncedStateParams () {
      if (!this.syncedState) return {}
      const url = new URL(this.syncedState)
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
