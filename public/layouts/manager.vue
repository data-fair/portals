<template>
  <v-app>
    <manager-top />
    <v-main>
      <nuxt-child />
    </v-main>
  </v-app>
</template>

<script>
  import ManagerTop from '~/components/layout/manager-top.vue'
  export default {
    components: { ManagerTop },
  }

</script>

<style>
</style>
