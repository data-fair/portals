<template>
  <ClientOnly>
    <d-frame
      v-bind="$attrs"
      .adapter="dFrameAdapter"
      @notif="onNotif"
    />
    <!-- Nothing is rendered server-side otherwise, and the content below would jump down on
         hydration once <d-frame> gives itself a height. The fallback reserves that height: a
         size container so the auto ratio can follow the frame width, and the same class for
         the margins. -->
    <template #fallback>
      <div
        :class="$attrs.class"
        style="container-type: inline-size"
      >
        <div
          :class="{ 'frame-placeholder': placeholderAuto }"
          :style="placeholderStyle"
        />
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import createDFrameAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter.js'
import { useUiNotif, type UiNotif } from '@data-fair/lib-vue/ui-notif.js'

// inheritAttrs:false keeps unknown attrs (iframe-title, src, aspect-ratio) off the SSR <ClientOnly> placeholder
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

// <d-frame> is registered globally by plugins/dframe.client.ts — must run before any <d-frame> is created,
// otherwise Vue's `.adapter` IDL binding is set on a not-yet-upgraded element and the constructor overwrites it.
const dFrameAdapter = createDFrameAdapter(useRouter())

// The placeholder mirrors the height d-frame computes from the same attributes
// (cf. https://github.com/data-fair/frame/blob/master/lib/DFrameElement.ts, updateStyle):
// the direct height, the fixed ratio, the width-based auto ratio (container queries of .frame-placeholder),
// or without any of them the 150px of its loading slot.
const placeholderStyle = computed(() => {
  if (attrs.height) return { minHeight: String(attrs.height) }
  const ratio = attrs['aspect-ratio']
  if (ratio === undefined || ratio === null) return { minHeight: '150px' }
  if (ratio !== '' && ratio !== 'auto') return { aspectRatio: String(ratio) }
  return undefined
})
const placeholderAuto = computed(() => placeholderStyle.value === undefined)

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

<style scoped>
/* same breakpoints as d-frame, on the frame width
   cf. https://github.com/data-fair/frame/blob/master/lib/DFrameElement.ts (actualAspectRatio) */
.frame-placeholder {
  aspect-ratio: 1;
}
@container (min-width: 500px) {
  .frame-placeholder {
    aspect-ratio: 4 / 3;
  }
}
@container (min-width: 800px) {
  .frame-placeholder {
    aspect-ratio: 16 / 9;
  }
}
@container (min-width: 1200px) {
  .frame-placeholder {
    aspect-ratio: 21 / 9;
  }
}
</style>
