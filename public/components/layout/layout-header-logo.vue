<template>
  <div :style="`float:${float};`">
    <a
      v-if="config.website"
      :href="config.website || '/'"
      style="height:100%"
      class="mr-3"
      target="blank"
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
import { mapState } from 'vuex'
export default {
  props: {
    float: { type: String, default: 'left' }
  },
  computed: {
    ...mapState(['config', 'textDark', 'portal', 'draft', 'publicUrl']),
    logoUrl () {
      return `${this.publicUrl}/api/v1/portals/${this.portal._id}/assets/logo?draft=${this.draft}`
    }
  }
}
</script>

<style>

</style>
