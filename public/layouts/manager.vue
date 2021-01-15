<template>
  <v-app>
    <manager-top v-if="!embed" />
    <v-main>
      <nuxt-child />
    </v-main>
  </v-app>
</template>

<script>
  import ManagerTop from '~/components/layout/manager-top.vue'
  export default {
    components: { ManagerTop },
    computed: {
      embed() {
        try {
          return window.self !== window.top
        } catch (e) {
          return true
        }
      },
    },
  }

</script>

<style>
</style>
