<template>
  <div style="float:left;">
    <a
      v-if="config.website"
      :href="config.website || '/'"
      style="height:100%"
      class="mr-3"
    >
      <img
        :src="logoUrl"
        :alt="config.title"
        contain
        style="height:80px"
      >
    </a>
    <nuxt-link
      v-else
      to="/"
      style="height:100%"
      class="mr-3"
    >
      <img
        :src="logoUrl"
        :alt="config.title"
        contain
        style="height:80px"
      >
    </nuxt-link>
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  export default {
    computed: {
      ...mapState(['config', 'textDark', 'portal', 'draft', 'publicUrl']),
      ...mapGetters(['themeColorDark']),
      logoUrl() {
        return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/logo?draft=${this.draft}`
      },
    },
  }
</script>

<style>

</style>
