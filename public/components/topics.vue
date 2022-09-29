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
        :to="{name: 'datasets', query: {topics: topic.value.id}}"
        class="mx-2 my-1 font-weight-bold text-none"
        dark
        rounded
        depressed
        :style="style(topic, hover)"
        :elevation="elevation"
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
  },
  methods: {
    style (topic, hover) {
      const color = this.$readableColor(topic.value.color)
      if (!(hover && this.hoverInverse)) {
        return `
        border: 2px solid ${color};
        color: ${color};
        background-color:white;`
      } else {
        return `
        border: 2px solid transparent;
        color: white;
        background-color:${color};`
      }
    }
  }
}
</script>
