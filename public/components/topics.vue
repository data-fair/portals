<template>
  <v-row
    v-if="topics"
    class="my-3"
    justify="center"
  >
    <v-btn
      v-for="topic in topics"
      :key="topic.value.id"
      :color="topic.value.color ? $readableColor(topic.value.color) : 'default'"
      :to="{name: 'datasets', query: {topics: topic.value.id}}"
      class="mx-2 my-1 font-weight-bold text-none"
      dark
      rounded
      depressed
      outlined
    >
      <v-icon
        v-if="topic.value.icon && topic.value.icon.name"
        left
        :size="24"
      >
        mdi-{{ topic.value.icon.name }}
      </v-icon>
      {{ topic.value.title }} ({{ topic.count }})
    </v-btn>
  </v-row>
</template>

<script>
export default {
  props: {
    topics: { type: Array, required: true }
  }
}
</script>
