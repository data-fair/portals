<template>
  <v-btn
    v-bind="compProps.btn"
    :aria-label="title"
    :title="title"
    class="action-icon ml-0"
    @click="e => $emit('click', e)"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <v-icon v-bind="compProps.icon">
      {{ icon }}
    </v-icon>
  </v-btn>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    dark: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    color: { type: String, default: 'primary' },
    to: { type: [String, Object], default: null },
    href: { type: String, default: null },
    target: { type: String, default: null },
    disabled: { type: Boolean, default: false }
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
        disabled: this.disabled,
        color: 'transparent',
        elevation: 0,
        class: 'pa-0',
        style: 'width:32px;height:32px;'
      }
      if (this.to) btn.to = this.to
      if (this.href) btn.href = this.href
      if (this.target) btn.target = this.target
      const icon = {
        color: this.dark ? 'white' : this.color
      }
      if (this.hovered && this.buttonOptions.includes('hoverInverse')) {
        btn.color = this.dark ? 'white' : this.color
        icon.color = this.dark ? this.color : 'white'
      }
      if (this.disabled) {
        delete btn.color
        delete icon.color
        btn.plain = true
      }
      return { btn, icon }
    }
  }
}
</script>

<style>
.v-btn.v-btn--fab.action-icon {
  margin-left: 0;
}
</style>
