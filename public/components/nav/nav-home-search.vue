<template>
  <v-text-field
    v-model="search"
    style="max-width:360px;"
    placeholder="Rechercher"
    append-icon="mdi-magnify"
    hide-details
    class="nav-home-search mb-2 v-input--is-focused primary--text"
    background-color="white"
    v-bind="textFieldProps"
    @keyup.enter.native="$router.push({name: 'datasets', query: {q: search}})"
    @click:append="$router.push({name: 'datasets', query: {q: search}})"
  />
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    search: ''
  }),
  computed: {
    ...mapState(['config']),
    textFieldProps () {
      return {
        outlined: this.config.homeSearchOptions.includes('outlined'),
        solo: this.config.homeSearchOptions.includes('solo'),
        rounded: this.config.homeSearchOptions.includes('rounded'),
        height: 56
      }
    }
  }
}
</script>

<style>
#app .nav-home-search .v-input__append-inner {
  margin-top: 0;
  height: 100%;
}
#app .nav-home-search .v-input__append-inner>.v-input__icon {
  height: 100%;
}
#app .nav-home-search:not(.v-text-field--rounded) .v-input__slot {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
