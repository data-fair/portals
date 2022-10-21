<template>
  <v-card
    v-bind="cardProps"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <nuxt-link
      v-if="to"
      :to="to"
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
    title: { type: String, default: '' },
    to: { type: [String, Object], default: null }
  },
  data () {
    return {
      hovered: false
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['elevation', 'actionCardOptions', 'actionCardBackgroundColor']),
    titleColorClass () {
      let c

      if (this.to && this.hovered && this.actionCardOptions.includes('hoverColorTitle')) {
        c += ' primary--text'
      } else {
        c += ' grey--text text--darken-3'
      }
      if (this.actionCardOptions.includes('hoverUnderlineTitle')) {
        c += ' underline-link'
        if (this.to && this.hovered) c += ' underline-link-hover'
      }

      return c
    },
    cardProps () {
      const props = {
        elevation: this.elevation,
        loading: this.loading,
        minHeight: 260,
        style: `background-color:${this.actionCardBackgroundColor}`
      }
      if (this.actionCardOptions.includes('outlined')) props.class = 'also-outlined'
      else props.class = 'not-outlined'

      if (this.to && this.hovered) {
        if (this.actionCardOptions.includes('hoverElevate')) props.elevation = Math.max(this.elevation * 2, 8)
        if (this.actionCardOptions.includes('hoverColorBorder')) props.class = 'primary-outlined'
      }

      return props
    }
  }
}
</script>

<style>
</style>
