<template>
  <div>
    DATASETS {{ datasetsFetch.error }} {{ datasetsFetch.data }}
  </div>
</template>

<script setup lang="ts">

const datasetsFetch = useLocalFetch('/data-fair/api/v1/datasets')
</script>
