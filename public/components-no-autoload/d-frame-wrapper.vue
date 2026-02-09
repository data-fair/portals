<template>
  <d-frame
    v-bind="$attrs"
    :adapter.prop="dFrameAdapter"
  />
</template>

<script>
import '@data-fair/frame/lib/d-frame.js'
import createDFrameAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter.js'

export default {
  data () {
    return {
      dFrameAdapter: null
    }
  },
  created () {
    this.dFrameAdapter = createDFrameAdapter(this.$router)
  }
}
</script>
