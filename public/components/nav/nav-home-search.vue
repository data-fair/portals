<template>
  <v-text-field
    v-model="search"
    rounded
    style="max-width:360px;"
    placeholder="Rechercher"
    outlined
    append-icon="mdi-magnify"
    hide-details
    class="mb-2 v-input--is-focused primary--text"
    background-color="white"
    @keyup.enter.native="$router.push({name: 'datasets', query: {q: search}})"
    @click:append="$router.push({name: 'datasets', query: {q: search}})"
  />
</template>

<script>
export default {
  data: () => ({
    search: ''
  })
}
</script>

<style>

</style>
