<template>
  <div :style="`float:${float};`">
    <a
      v-if="config.website"
      :href="config.website || '/'"
      :style="`height:${height}px; display: block;`"
      class="mr-3"
      target="blank"
    >
      <img
        :src="logoUrl"
        :alt="config.title"
        contain
        :style="`height:${height}px`"
      >
    </a>
    <nuxt-link
      v-else
      to="/"
      :style="`height:${height}px; display: block;`"
      class="mr-3"
    >
      <img
        :src="logoUrl"
        :alt="config.title"
        contain
        :style="`height:${height}px`"
      >
    </nuxt-link>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: {
    float: { type: String, default: 'left' },
    height: { type: Number, default: 80 }
  },
  computed: {
    ...mapState(['config', 'textDark', 'portal', 'draft', 'publicUrl']),
    ...mapGetters(['logoUrl'])
  }
}
</script>

<style>

</style>
