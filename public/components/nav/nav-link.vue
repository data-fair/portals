<template>
  <nuxt-link
    v-if="config.navLinkMode.startsWith('link')"
    class="title"
    :to="to"
  >
    <v-icon
      v-if="icon && config.navLinkMode === 'link'"
      color="primary"
    >
      {{ icon }}
    </v-icon>
    &nbsp;<span class="underline-link">{{ title }}</span>
  </nuxt-link>
  <v-btn
    v-else-if="config.navLinkMode.startsWith('btn')"
    v-bind="btnProps"
    :to="to"
    exact
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <v-icon
      v-if="icon && !config.navLinkMode.includes('NoIcon')"
      :color="isDark ? 'white' : 'primary'"
    >
      {{ icon }}
    </v-icon>
    &nbsp;<span>{{ title }}</span>
  </v-btn>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    to: { type: [String, Object], required: true },
    title: { type: String, required: true },
    icon: { type: String, default: null }
  },
  data () {
    return {
      hovered: false
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['buttonOptions']),
    isDark () {
      let dark = !this.config.navLinkMode.includes('Outlined')
      if (this.hovered && this.buttonOptions.includes('hoverInverse')) dark = !dark
      return dark
    },
    btnProps () {
      if (this.isDark) {
        return { depressed: true, color: 'primary', class: 'white--text' }
      } else {
        return { outlined: true, color: 'primary' }
      }
    }
  }
}
</script>

<style>

</style>
