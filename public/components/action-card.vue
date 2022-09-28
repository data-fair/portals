<template>
  <v-card v-bind="cardProps">
    <nuxt-link
      v-if="to"
      :to="to"
      style="text-decoration:none"
    >
      <card-title :title="title" />
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
import { mapState } from 'vuex'

export default {
  components: {},
  props: {
    loading: { type: Boolean, default: false },
    title: { type: String, default: null },
    to: { type: [String, Object], default: null }
  },
  data () {
    return {}
  },
  computed: {
    ...mapState(['config']),
    cardProps () {
      return {
        loading: this.loading,
        minHeight: 260,
        hover: !!this.to,
        class: 'also-outlined'
      }
    }
  }
}
</script>

<style>
</style>
