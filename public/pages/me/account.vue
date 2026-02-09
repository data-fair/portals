<template lang="html">
  <d-frame-wrapper
    iframe-title="Mon compte"
    src="/simple-directory/me"
  />
</template>

<script>

export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
  layout: 'personal',
  middleware: ['portal-required', 'auth-required']
}
</script>
