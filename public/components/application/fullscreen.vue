<template>
  <v-tooltip top>
    <template #activator="{ on }">
      <v-btn
        :to="{name: 'reuses-id-full', params:{id: application.id}, query: syncedStateParams}"
        icon
        nuxt
        v-on="on"
      >
        <v-icon color="primary">
          mdi-fullscreen
        </v-icon>
      </v-btn>
    </template>
    <span>Accéder à la visualisation en plein écran</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    application: { type: Object, required: true },
    syncedState: { type: Object, default: null }
  },
  computed: {
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
