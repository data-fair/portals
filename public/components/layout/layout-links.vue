<template>
  <v-row justify="center">
    <v-hover
      v-for="(link, i) in links"
      v-slot="{hover}"
      :key="i"
    >
      <v-card
        :style="style(hover)"
        v-bind="compProps(link, hover)"
        class="layout-link"
      >
        <v-card-title class="justify-center pt-3 pb-1">
          <v-icon
            v-if="link.icon && link.icon.name"
            left
            :size="36"
            :color="textColor(hover)"
            class="ma-0"
          >
            mdi-{{ link.icon.name }}
          </v-icon>
        </v-card-title>
        <v-card-text
          :style="`color: ${textColor(hover)};`"
          class="font-weight-bold text-none justify-center text-center pb-3"
        >
          {{ link.title }}
        </v-card-text>
      </v-card>
    </v-hover>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    links: { type: Array, required: true },
    options: { type: Array, default: () => ['outlined', 'elevate'] }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['elevation', 'hoverInverse', 'radius', 'readablePrimaryColor'])
  },
  methods: {
    compProps (link, hover) {
      const props = {
        class: 'mx-2 my-1 font-weight-bold text-none',
        outlined: this.options.includes('outlined'),
        elevation: this.options.includes('elevate') ? this.elevation : 0
      }
      props.rounded = this.options.includes('rounded') ? 'xl' : !!this.radius

      if (hover) {
        if (this.config.actionCardOptions.includes('hoverElevate')) props.elevation = Math.max(this.elevation * 2, 8)
      }
      if (link.href) {
        if (link.href.startsWith('/')) props.to = link.href
        else props.href = link.href
      }
      return props
    },
    isDark (hover) {
      let dark = hover && this.hoverInverse
      if (this.options.includes('reverseColor')) dark = !dark
      return dark
    },
    textColor (hover) {
      return this.isDark(hover) ? 'white' : this.readablePrimaryColor
    },
    style (hover) {
      const color = this.readablePrimaryColor
      const borderColor = this.options.includes('outlined') ? color : 'transparent'
      const maxTitleLength = Math.max(...this.links.map(l => (l.title || '').length))
      if (this.isDark(hover)) {
        return `
        border: 2px solid transparent;
        width: ${32 + maxTitleLength * 10}px;
        color: white;
        background-color:${color};`
      } else {
        return `
        border: 2px solid ${borderColor};
        width: ${32 + maxTitleLength * 10}px;
        color: ${color};
        background-color:white;`
      }
    }
  }
}
</script>

<style>
.layout-link {
  min-width: 90px;
}
</style>
