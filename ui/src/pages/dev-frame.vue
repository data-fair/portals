<template>
  <div style="background-color: red; color: white; height: 50px; width: 100%;">
    header
  </div>
  <d-frame-wrapper
    src="https://opendata-edf.staging-koumoul.com/datasets/"
    sync-path="#"
    sync-params
    style="height: calc(100vh - 50px)"
  />
  <div style="background-color: blue; color: white; height: 50px; width: 100%;">
    footer
  </div>
</template>

<script setup lang="ts">
</script>
