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

// d-frame.js calls customElements.define() at module top level — browser-only
if (import.meta.client) import('@data-fair/frame/lib/d-frame.js')

const dFrameAdapter = createDFrameAdapter(useRouter())
</script>
