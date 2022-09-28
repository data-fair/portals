<template>
  <v-row
    v-if="topics"
    class="my-3"
    justify="center"
  >
    <v-hover
      v-for="topic in topics"
      v-slot="{hover}"
      :key="topic.value.id"
    >
      <v-btn
        :color="topic.value.color ? $readableColor(topic.value.color) : 'default'"
        :to="{name: 'datasets', query: {topics: topic.value.id}}"
        class="mx-2 my-1 font-weight-bold text-none"
        dark
        rounded
        depressed
        :outlined="!(hover && hoverInverse)"
        :elevation="elevation"
        :style="hover && hoverInverse ? '' : 'background-color:white'"
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
    </v-hover>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    topics: { type: Array, required: true }
  },
  computed: {
    ...mapGetters(['elevation', 'hoverInverse'])
  }
}
</script>
