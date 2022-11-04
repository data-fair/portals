<template>
  <v-row
    v-if="topics"
    :class="rowClass"
    :justify="justify"
  >
    <v-hover
      v-for="topic in topics"
      v-slot="{hover}"
      :key="topic.id"
    >
      <v-card
        v-if="options.includes('card')"
        :to="{name: 'datasets', query: {topics: topic.id}}"
        :style="style(topic, hover)"
        v-bind="compProps(hover)"
      >
        <v-card-title class="justify-center pt-3 pb-1">
          <v-icon
            v-if="topic.icon && topic.icon.name"
            left
            :size="36"
            :color="textColor(topic, hover)"
          >
            mdi-{{ topic.icon.name }}
          </v-icon>
        </v-card-title>
        <v-card-text
          :style="`color: ${textColor(topic, hover)};`"
          class="font-weight-bold text-none justify-center pb-3"
        >
          {{ topic.title }} <template v-if="topic.count">
            ({{ topic.count }})
          </template>
        </v-card-text>
      </v-card>
      <v-btn
        v-else
        :to="{name: 'datasets', query: {topics: topic.id}}"
        dark
        :small="small"
        v-bind="compProps(hover, true)"
        depressed
        :style="style(topic, hover)"
      >
        <v-icon
          v-if="topic.icon && topic.icon.name"
          left
          :size="24"
        >
          mdi-{{ topic.icon.name }}
        </v-icon>

        {{ topic.title }} <template v-if="topic.count">
          ({{ topic.count }})
        </template>
      </v-btn>
    </v-hover>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    topics: { type: Array, required: true },
    small: { type: Boolean, default: false },
    justify: { type: String, default: 'center' },
    rowClass: { type: String, default: 'my-3' },
    options: { type: Array, default: () => ['outlined', 'rounded', 'elevate'] }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['elevation', 'hoverInverse', 'radius', 'readableTopicColor'])
  },
  methods: {
    compProps (hover, btn) {
      const props = {
        class: 'mx-2 my-1 font-weight-bold text-none',
        outlined: this.options.includes('outlined'),
        elevation: this.options.includes('elevate') ? this.elevation : 0
      }
      if (btn) {
        props.rounded = this.options.includes('rounded')
      } else {
        props.rounded = this.options.includes('rounded') ? 'xl' : !!this.radius
      }
      if (hover) {
        if (this.config.actionCardOptions.includes('hoverElevate')) props.elevation = Math.max(this.elevation * 2, 8)
      }
      return props
    },
    isDark (hover) {
      let dark = hover && this.hoverInverse
      if (this.options.includes('reverseColor')) dark = !dark
      return dark
    },
    textColor (topic, hover) {
      return this.isDark(hover) ? 'white' : this.readableTopicColor(topic)
    },
    style (topic, hover) {
      const color = this.readableTopicColor(topic)
      const borderColor = this.options.includes('outlined') ? color : 'transparent'
      if (this.isDark(hover)) {
        return `
        border: 2px solid transparent;
        color: white;
        background-color:${color};`
      } else {
        return `
        border: 2px solid ${borderColor};
        color: ${color};
        background-color:white;`
      }
    }
  }
}
</script>
