<template>
  <ClientOnly>
    <d-frame
      v-bind="$attrs"
      .adapter="dFrameAdapter"
      @notif="onNotif"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import createDFrameAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter.js'
import { useUiNotif, type UiNotif } from '@data-fair/lib-vue/ui-notif.js'

// inheritAttrs:false keeps unknown attrs (iframe-title, src, aspect-ratio) off the SSR <ClientOnly> placeholder
defineOptions({ inheritAttrs: false })

// <d-frame> is registered globally by plugins/dframe.client.ts — must run before any <d-frame> is created,
// otherwise Vue's `.adapter` IDL binding is set on a not-yet-upgraded element and the constructor overwrites it.
const dFrameAdapter = createDFrameAdapter(useRouter())

// An embedded sub-app (data-fair, events, ...) delegates its ui-notif to the host when inside an iframe:
// its own lib snackbar stays silent and posts the notif up, which <d-frame> re-dispatches as a `notif` event.
// The event carries the flattened { type, title, detail } shape; rebuild the { msg, errorMsg, clientError }
// shape sendUiNotif expects so error notifs keep their detail line (a naive { msg: title } drops it).
const { sendUiNotif } = useUiNotif()
const frameNotifArg = (notif: { type: string, title?: string, detail?: string }): UiNotif => {
  if (notif.type === 'error' || notif.type === 'warning') {
    return { type: 'error', msg: notif.title ?? '', errorMsg: notif.detail ?? notif.title ?? '', clientError: notif.type === 'warning' }
  }
  return { type: notif.type as 'default' | 'info' | 'success' | 'warning', msg: notif.title ?? notif.detail ?? '' }
}
const onNotif = (e: Event) => sendUiNotif(frameNotifArg((e as CustomEvent).detail))
</script>
