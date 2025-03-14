<template>
  <d-frame
    :iframe-title="title"
    :src="src"
    :height="height"
    :resize="resize"
    sync-params
  />
</template>

<script>
import '@data-fair/frame/lib/d-frame.js'
export default {
  props: {
    src: { type: String, required: true },
    title: { type: String, required: true },
    height: { type: String, default: '' },
    resize: { type: String, default: 'no' }
  }
}
</script>
