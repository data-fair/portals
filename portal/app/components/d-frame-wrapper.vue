<template>
  <ClientOnly>
    <d-frame
      v-bind="$attrs"
      .adapter="dFrameAdapter"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import createDFrameAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter.js'

// inheritAttrs:false keeps unknown attrs (iframe-title, src, aspect-ratio) off the SSR <ClientOnly> placeholder
defineOptions({ inheritAttrs: false })

// <d-frame> is registered globally by plugins/dframe.client.ts — must run before any <d-frame> is created,
// otherwise Vue's `.adapter` IDL binding is set on a not-yet-upgraded element and the constructor overwrites it.
const dFrameAdapter = createDFrameAdapter(useRouter())
</script>
