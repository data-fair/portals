<template>
  <action-icon
    title="Accéder à la visualisation en plein écran"
    icon="mdi-fullscreen"
    :to="{name: 'applications-id-full', params:{id: application.id}, query: syncedStateParams}"
  />
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
