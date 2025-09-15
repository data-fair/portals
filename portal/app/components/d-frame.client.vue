<template>
  <d-frame-internal v-bind="$attrs" />
</template>

<script setup lang="ts">
import DFrameElement from '@data-fair/frame/lib/DFrameElement.js'
if (!customElements.get('d-frame-internal')) {
  customElements.define('d-frame-internal', DFrameElement)
}

</script>
