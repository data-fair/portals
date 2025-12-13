<template>
  <div style="background-color: red; color: white; height: 50px; width: 100%;">
    header
  </div>
  <d-frame-wrapper
    src="https://opendata-edf.staging-koumoul.com/datasets/"
    sync-path="#"
    sync-params
    height="calc(100vh - 100px)"
    style="min-height:calc(100vh - 100px)"
  />
  <div style="background-color: blue; color: white; height: 50px; width: 100%;">
    footer
  </div>
</template>

<script setup lang="ts">
</script>
