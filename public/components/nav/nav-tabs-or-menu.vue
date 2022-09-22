<template>
  <v-row>
    <nav-menu
      :visible="$vuetify.breakpoint.smAndDown || overflowing"
      :background-dark="backgroundDark"
      :navigation="navigation"
    />
    <nav-tabs
      v-show="!$vuetify.breakpoint.smAndDown && !overflowing"
      :background-dark="backgroundDark"
      :navigation="navigation"
      @overflowing="overflowing = true"
    />
  </v-row>
</template>

<script>
export default {
  props: {
    navigation: { type: Array, required: true },
    backgroundDark: { type: Boolean, required: true },
    dense: { type: Boolean, default: false }
  },
  data: () => ({
    overflowing: false
  })
}
</script>

<style>

</style>
