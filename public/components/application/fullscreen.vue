<template>
  <v-tooltip top>
    <template #activator="{ on }">
      <v-btn
        :to="{name: 'reuses-id-full', params:{id: application.id}}"
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
    application: { type: Object, required: true }
  }
}
</script>

<style>

</style>
