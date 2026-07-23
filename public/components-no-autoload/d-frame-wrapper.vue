<template>
  <d-frame
    v-bind="$attrs"
    :adapter.prop="dFrameAdapter"
    v-on="$listeners"
    @notif="onNotif"
  />
</template>

<script>
import '@data-fair/frame/lib/d-frame.js'
import createDFrameAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter.js'
import eventBus from '~/event-bus'

export default {
  data () {
    return {
      dFrameAdapter: null
    }
  },
  created () {
    this.dFrameAdapter = createDFrameAdapter(this.$router)
  },
  methods: {
    // an embedded sub-app (data-fair, ...) delegates its ui-notif to the host when inside an iframe:
    // its own snackbar stays silent and posts the notif up, which <d-frame> re-dispatches as a notif event
    onNotif (e) {
      const { type, title, detail } = e.detail
      eventBus.$emit('notification', { type, msg: title, errorMsg: detail })
    }
  }
}
</script>
