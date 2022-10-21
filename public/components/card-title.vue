<template>
  <v-card-title>
    <v-tooltip top>
      <template #activator="{ on, attrs }">
        <h3
          :class="`title ${colorClass || 'grey--text text--darken-3'} font-weight-bold`"
          :style="`height:${lines * 22}px;line-height: 1.1;overflow: hidden;`"
          v-bind="attrs"
          v-on="on"
        >
          <v-clamp
            :max-lines="lines"
            autoresize
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
  }
}
</script>

<style>

</style>
