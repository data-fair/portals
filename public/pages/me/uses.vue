<template lang="html">
  <use-manage />
</template>

<script>
export default {
  layout: 'personal',
  middleware: ['portal-required', 'auth-required']
}
</script>
