<template>
  <d-frame
    :src="`/data-fair/next-ui/embed/dataset/${$route.params.ref}/table`"
    class="fill-height"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })
</script>
