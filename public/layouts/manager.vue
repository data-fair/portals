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
        return this.$route.query.embed === 'true'
      },
    },
  }

</script>

<style>
</style>
