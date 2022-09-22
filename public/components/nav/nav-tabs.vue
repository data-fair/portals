<template>
  <v-tabs
    ref="tabs"
    v-model="computedActiveTab"
    height="64"
    :dark="backgroundDark"
    centered
    slider-size="4"
    optional
    background-color="transparent"
  >
    <v-tabs-slider :color="backgroundDark ? 'white' : textDark" />
    <template v-for="(item, i) of navigation">
      <v-tab
        v-if="item.to"
        :key="`tab-${i}`"
        :to="item.to"
        nuxt
        :exact="item.to === '/'"
        class="font-weight-bold"
        :class="{'white--text': backgroundDark}"
      >
        {{ item.title }}
      </v-tab>
      <v-menu
        v-if="item.children"
        :key="`menu-${i}`"
        offset-y
        nudge-left
      >
        <template #activator="{ on, attrs }">
          <v-tab
            v-bind="attrs"
            class="font-weight-bold"
            :class="{'white--text': backgroundDark}"
            v-on="on"
          >
            {{ item.title }}
            <v-icon right>
              mdi-menu-down
            </v-icon>
          </v-tab>
        </template>
        <v-list>
          <v-list-item
            v-for="(child, j) in item.children"
            :key="`child-${i}-${j}`"
            :to="child.to"
            nuxt
          >
            <v-list-item-title>{{ child.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-tabs>
</template>

<script>
import { mapState } from 'vuex'
const debug = require('debug')('nav-tabs')
debug.log = console.log.bind(console)

export default {
  props: {
    navigation: { type: Array, required: true },
    backgroundDark: { type: Boolean, required: true },
    dense: { type: Boolean, default: false }
  },
  data: () => ({
    activeTab: null
  }),
  computed: {
    ...mapState(['textDark']),
    homeFullPath () {
      const base = this.$router.options.base
      return base.endsWith('/') ? base : base + '/'
    },
    computedActiveTab: {
      get () {
        return this.activeTab
      },
      set (value) {
        debug('set computedActiveTab', value)
        if (value === 0) value = '/'
        this.activeTab = value
      }
    },
    menusActiveChildren () {
      const menus = {}
      for (const item of this.navigation) {
        if (item.children) {
          menus[item.title] = item.children.find(child => child.to === this.$route.path)
        }
      }
      return menus
    }
  },
  watch: {
    '$route.path': {
      async handler () {
        debug('watch $route.path', this.$route.path)
        if (this.$route.path === '/') {
          debug('set active tab to home', this.homeFullPath)
          this.activeTab = this.homeFullPath
        } else {
          const currentMenu = this.navigation.findIndex(item => item.children && item.children.find(child => child.to === this.$route.path))
          debug('current active menu', currentMenu)
          if (currentMenu !== -1) {
            await this.$nextTick()
            this.activeTab = currentMenu
          }
        }
      },
      immediate: true
    }
  },
  async mounted () {
    for (let i = 0; i < 4; i++) {
      await this.$nextTick()
      const wrapperWidth = this.$refs.tabs.$el.querySelector('.v-slide-group__wrapper').offsetWidth
      const contentWidth = this.$refs.tabs.$el.querySelector('.v-slide-group__content').offsetWidth
      const localWidth = this.$el.offsetWidth
      const parentWidth = this.$parent.$el.offsetWidth
      debug(`check overflowing ${i} : wrapper=${wrapperWidth}, content=${contentWidth}, local=${localWidth}, parent=${parentWidth}`)
      if (wrapperWidth < contentWidth || parentWidth < localWidth) {
        this.$emit('overflowing', true)
        break
      }
    }
  }
}
</script>

<style>

</style>
