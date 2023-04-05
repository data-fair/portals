<template>
  <nuxt-link
    v-if="config.navLinkMode.startsWith('link')"
    :class="`title ${config.navLinkColor}--text`"
    :to="to"
  >
    <v-icon
      v-if="icon && config.navLinkMode === 'link'"
      :color="config.navLinkColor"
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
    <template v-if="icon && !config.navLinkMode.includes('NoIcon')">
      <v-icon
        :color="textColor"
      >
        {{ icon }}
      </v-icon>
    &nbsp;
    </template>
    <span>{{ title }}</span>
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
    ...mapGetters(['buttonOptions', 'navLinkColor', 'navLinkColorDark', 'readableNavLinkColor', 'readablePrimaryColor']),
    isOutlined () {
      let outlined = this.config.navLinkMode.includes('Outlined')
      if (this.hovered && this.buttonOptions.includes('hoverInverse')) outlined = !outlined
      return outlined
    },
    btnColor () {
      if (this.config.navLinkMode.includes('Outlined')) {
        return this.readableNavLinkColor
      }
      return this.navLinkColor
    },
    lineColor () {
      if (this.config.navLinkMode.includes('Outlined')) {
        return this.isOutlined ? this.readableNavLinkColor : 'white'
      }
      if (this.isOutlined) {
        if (this.navLinkColorDark) return this.navLinkColor
        return this.readablePrimaryColor
      }
      if (this.navLinkColorDark) return 'white'
      return this.readablePrimaryColor
    },
    btnProps () {
      return {
        depressed: !this.isOutlined,
        outlined: this.isOutlined,
        color: this.btnColor,
        style: {
          color: this.lineColor,
          'border-color': this.lineColor
        }
      }
    }
  }
}
</script>

<style>

</style>
