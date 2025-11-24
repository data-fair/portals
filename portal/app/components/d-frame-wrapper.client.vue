<template>
  <d-frame
    v-bind="$attrs"
    .adapter="dFrameAdapter"
  />
</template>

<script setup lang="ts">
import '@data-fair/frame/lib/d-frame.js'
import createDFrameAdapter from '@data-fair/frame/lib/vue-router/state-change-adapter.js'
const dFrameAdapter = createDFrameAdapter(useRouter())
</script>
