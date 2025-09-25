<template>
  <d-frame
    :src="`/data-fair/app/${$route.params.ref}`"
    class="fill-height"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })
</script>
