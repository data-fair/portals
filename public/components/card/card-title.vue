<template>
  <v-card-title class="pb-2">
    <v-tooltip top>
      <template #activator="{ on, attrs }">
        <h3
          class="title font-weight-bold"
          :style="`height:${paddingBottom + 3 + (lines * 22)}px;line-height: 1.1;overflow:hidden;width:100%;`"
          v-bind="attrs"
          v-on="on"
        >
          <v-clamp
            :max-lines="lines"
            autoresize
            :class="colorClass || 'grey--text text--darken-3'"
            :style="`width: 100%;padding-bottom:${paddingBottom}px;`"
          >
            {{ title }}
          </v-clamp>
        </h3>
      </template>
      <span>{{ title }}</span>
    </v-tooltip>
  </v-card-title>
</template>

<script>
import VClamp from 'vue-clamp'

export default {
  components: { VClamp },
  props: {
    title: { type: String, required: true },
    colorClass: { type: String, default: null },
    lines: { type: Number, default: 2 }
  },
  computed: {
    paddingBottom () {
      return 6
    }
  }
}
</script>

<style>

</style>
