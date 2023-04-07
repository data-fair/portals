<template lang="html">
  <use-manage />
</template>

<script>
export default {
  layout: 'partner',
  middleware: ['portal-required', 'auth-required']
}
</script>
