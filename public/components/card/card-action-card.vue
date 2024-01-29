<template>
  <v-card
    v-bind="cardProps"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <template v-if="layout === 'dense' || layout === 'medium' || layout === 'vertical' || $vuetify.breakpoint.smAndDown">
      <optional-link
        :to="to"
        :title="title"
      >
        <card-title
          :title="title"
          :color-class="titleColorClass"
        />
        <v-img
          v-if="img"
          :src="img"
          alt=""
          :height="170"
          :contain="imgContain"
          :class="{'mb-2': !!img}"
          :aspect-ratio="imgAspectRatio"
        />
      </optional-link>
      <card-text
        v-if="!img || (layout !== 'dense' && layout !== 'medium')"
        :html="html"
      />
      <card-topics :topics="topics" />
      <slot name="bottom" />
    </template>

    <template v-if="layout === 'list' && $vuetify.breakpoint.mdAndUp">
      <optional-link
        :to="to"
        :title="title"
      >
        <card-title
          :title="title"
          :color-class="titleColorClass"
        />
      </optional-link>
      <card-text
        :html="html"
        :height="70"
      />
      <slot name="bottom" />
    </template>

    <v-row
      v-if="layout==='horizontal' && $vuetify.breakpoint.mdAndUp"
      dense
      style="height:246px;"
    >
      <v-col
        cols="4"
        class="pr-0"
      >
        <optional-link
          :to="to"
          :title="title"
        >
          <v-img
            v-if="img"
            :src="img"
            alt=""
            height="238"
            :contain="imgContain"
            :aspect-ratio="imgAspectRatio"
          />
        </optional-link>
      </v-col>
      <v-col
        cols="8"
        class="pl-0"
      >
        <optional-link
          :to="to"
          :title="title"
        >
          <card-title
            :title="title"
            :color-class="titleColorClass"
          />
        </optional-link>
        <card-text
          :html="html"
          :height="90"
        />
        <card-topics :topics="topics" />
        <slot name="bottom" />
      </v-col>
    </v-row>
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
    ...mapGetters(['elevation', 'actionCardBackgroundColor']),
    actionCardOptions () {
      if (this.layout === 'list') {
        const options = this.config.actionCardHorizontalOptions.filter(o => o !== 'outlined' && o !== 'hoverElevate')
        options.push('flat')
        return options
      }
      return this.layout === 'horizontal' ? this.config.actionCardHorizontalOptions : this.config.actionCardOptions
    },
    titleColorClass () {
      let c = ''
      if (this.to && this.hovered && this.actionCardOptions.includes('hoverColorTitle')) {
        c += ' primary-darker--text'
      } else {
        c += ' grey--text text--darken-3'
      }
      if (this.actionCardOptions.includes('hoverUnderlineTitle')) {
        c += ' underline-link underline-link-partial'
        if (this.to && this.hovered) c += ' underline-link-hover'
      }
      return c
    },
    cardProps () {
      const props = {
        elevation: this.elevation,
        loading: this.loading,
        style: `background-color:${this.layout === 'list' ? 'transparent' : this.actionCardBackgroundColor(this.layout === 'horizontal')}`
      }
      if (this.actionCardOptions.includes('outlined')) props.class = 'also-outlined'
      else props.class = 'not-outlined'

      if (this.layout === 'dense' || this.layout === 'medium') props.minHeight = 260

      if (this.actionCardOptions.includes('flat')) props.elevation = 0

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
