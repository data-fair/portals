<template>
  <v-tooltip
    :bottom="tooltipBottom"
    :top="!tooltipBottom"
  >
    <template #activator="{ on: onTooltip }">
      <v-btn
        v-bind="compProps.btn"
        :aria-label="title"
        @click="e => $emit('click', e)"
        v-on="{...onTooltip}"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
      >
        <v-icon v-bind="compProps.icon">
          {{ icon }}
        </v-icon>
      </v-btn>
    </template>
    <span>{{ title }}</span>
  </v-tooltip>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    dark: { type: Boolean, default: false },
    tooltipBottom: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    color: { type: String, default: 'primary' },
    to: { type: [String, Object], default: null },
    href: { type: String, default: null }
  },
  data () {
    return {
      hovered: false
    }
  },
  computed: {
    ...mapGetters(['buttonOptions']),
    compProps () {
      const btn = {
        fab: true,
        small: true,
        loading: this.loading,
        color: 'transparent',
        elevation: 0,
        class: 'pa-0',
        style: 'width:32px;height:32px;'
      }
      if (this.to) btn.to = this.to
      if (this.href) btn.href = this.href
      const icon = {
        color: this.dark ? 'white' : this.color
      }
      if (this.hovered && this.buttonOptions.includes('hoverInverse')) {
        btn.color = this.dark ? 'white' : this.color
        icon.color = this.dark ? this.color : 'white'
      }
      return { btn, icon }
    }
  }
}
</script>

<style>

</style>
