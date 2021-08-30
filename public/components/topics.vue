<template>
  <v-row v-if="topics" class="my-3">
    <v-chip
      v-for="topic in topics"
      :key="topic.value.id"
      :color="topic.value.color"
      :to="{name: 'datasets', query: {topics: topic.value.id}}"
      class="ml-3 my-1"
      outlined
      nuxt
    >
      {{ topic.value.title }} ({{ topic.count }})
    </v-chip>
  </v-row>
</template>

<script>
  export default {
    props: {
      topics: { type: Array, required: true },
    },
  }
</script>
