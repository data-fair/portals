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
        :style="`max-height:${height}px;max-width:${$vuetify.breakpoint.width / 2}px`"
      >
    </a>
    <nuxt-link
      v-else
      to="/"
      :style="`height:${height}px; display: block;`"
      class="mr-3"
      :title="$t('homeLink')"
    >
      <img
        :src="logoUrl"
        :alt="config.title"
        :style="`max-height:${height}px;max-width:${$vuetify.breakpoint.width / 2}px`"
      >
    </nuxt-link>
  </div>
</template>

<i18n lang="yaml">
  fr:
    homeLink: retour à l'accueil
  en:
    homeLink: go to home page
</i18n>

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
