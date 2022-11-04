<template>
  <v-card-text
    :style="`height:${height}px;color: rgba(0,0,0,0.87)`"
    class="py-0"
  >
    <client-only>
      <v-clamp
        :max-height="height"
        :class="`card-gradient-desc${height}`"
        autoresize
        v-html="html"
      />
    </client-only>
  </v-card-text>
</template>

<script>
import VClamp from 'vue-clamp'

export default {
  components: { VClamp },
  props: {
    html: { type: String, default: '' },
    height: { type: Number, default: 170 }
  }
}
</script>

<style>

</style>
