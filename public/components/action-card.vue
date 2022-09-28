<template>
  <v-card
    v-bind="cardProps"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <nuxt-link
      v-if="to"
      :to="to"
      style="text-decoration:none"
    >
      <card-title
        :title="title"
        :color-class="titleColorClass"
      />
      <slot />
    </nuxt-link>
    <template v-else>
      <card-title :title="title" />
      <slot />
    </template>
    <slot name="bottom" />
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  components: {},
  props: {
    loading: { type: Boolean, default: false },
    title: { type: String, default: null },
    to: { type: [String, Object], default: null }
  },
  data () {
    return {
      hovered: false
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['elevation']),
    options () {
      return this.config.actionCardOptions || ['hoverElevate']
    },
    titleColorClass () {
      let c = ''
      if (this.to && this.hovered) {
        if (this.options.includes('hoverColorTitle')) c += ' primary--text'
        if (this.options.includes('hoverUnderlineTitle')) c += ' text-decoration-underline'
      }

      return c
    },
    cardProps () {
      const props = {
        elevation: this.elevation,
        loading: this.loading,
        minHeight: 260,
        class: 'also-outlined'
      }

      if (this.to && this.hovered) {
        if (this.options.includes('hoverElevate')) props.elevation = Math.max(this.elevation * 2, 8)
        if (this.options.includes('hoverColorBorder')) props.class = 'primary-outlined'
      }

      return props
    }
  }
}
</script>

<style>
</style>
