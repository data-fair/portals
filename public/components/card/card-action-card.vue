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
      <card-layout v-bind="{layout, title, img, imgContain, imgAspectRatio, html, topics, titleColorClass}">
        <template #bottom>
          <slot name="bottom" />
        </template>
      </card-layout>
    </nuxt-link>
    <template v-else>
      <card-layout v-bind="{layout, title, img, imgContain, imgAspectRatio, html, topics, titleColorClass}">
        <template #bottom>
          <slot name="bottom" />
        </template>
      </card-layout>
    </template>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    layout: { type: String, default: 'dense' },
    loading: { type: Boolean, default: false },
    to: { type: [String, Object], default: null },
    title: { type: String, default: '' },
    img: { type: String, default: '' },
    imgContain: { type: Boolean, default: false },
    imgAspectRatio: { type: Number, default: null },
    html: { type: String, default: '' },
    topics: { type: Array, default: null }
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
        style: `background-color:${this.actionCardBackgroundColor}`
      }
      if (this.actionCardOptions.includes('outlined')) props.class = 'also-outlined'
      else props.class = 'not-outlined'

      if (this.layout === 'dense') {
        props.minHeight = 260
      }

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
