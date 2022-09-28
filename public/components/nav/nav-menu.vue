<template>
  <!-- smaller screens: navigation in menu -->
  <v-menu
    bottom
    left
    offset-y
  >
    <template #activator="{ on }">
      <v-btn
        v-show="visible"
        text
        tile
        class="font-weight-bold"
        :class="{'white--text': backgroundDark}"
        :height="64"
        v-on="on"
      >
        <v-icon class="mr-2">
          mdi-menu
        </v-icon>
        {{ activeItemTitle }}
      </v-btn>
    </template>
    <v-list>
      <template v-for="(item, i) of navigation">
        <v-list-item
          v-if="item.to"
          :key="`single-item-${i}`"
          :to="item.to"
          nuxt
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
        <template v-if="item.children">
          <v-divider :key="`divider-before-${i}`" />
          <v-subheader :key="`header-${i}`">
            {{ item.title }}
          </v-subheader>
          <v-list-item
            v-for="(child, j) of item.children"
            :key="`child-${i}-${j}`"
            :to="child.to"
            nuxt
          >
            <v-list-item-title>{{ child.title }}</v-list-item-title>
          </v-list-item>
          <v-divider :key="`divider-after-${i}`" />
        </template>
      </template>
    </v-list>
  </v-menu>
</template>

<script>
const debug = require('debug')('nav-menu')
debug.log = console.log.bind(console)

export default {
  props: {
    navigation: { type: Array, required: true },
    visible: { type: Boolean, required: true },
    backgroundDark: { type: Boolean, required: true }
  },
  data: () => ({
    activeItemTitle: null
  }),
  watch: {
    '$route.path': {
      async handler () {
        debug('watch $route.path', this.$route.path)
        const activeItem = this.navigation.find(item => item.to === this.$route.path)
        if (activeItem) {
          debug('activeItem', activeItem)
          this.activeItemTitle = activeItem.title
        }
        const activeMenu = this.navigation.find(item => item.children && item.children.find(child => child.to === this.$route.path))
        if (activeMenu) {
          const activeChild = activeMenu.children.find(child => child.to === this.$route.path)
          this.activeItemTitle = activeChild.title
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="css" scoped>
</style>
