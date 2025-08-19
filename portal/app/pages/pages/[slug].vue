<template>
  <v-container>
  HELLO {{ pageConfigFetch.data }}
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const pageConfigFetch = await useFetch('/portal/api/pages/' + route.params.slug, { watch: false })
</script>
