<template>
  <v-row
    v-if="topics"
    :class="rowClass"
    :justify="justify"
  >
    <v-hover
      v-for="topic in topics"
      v-slot="{hover}"
      :key="topic.id"
    >
      <v-btn
        :to="{name: 'datasets', query: {topics: topic.id}}"
        class="mx-2 my-1 font-weight-bold text-none"
        dark
        :small="small"
        rounded
        depressed
        :style="style(topic, hover)"
        :elevation="elevation"
      >
        <v-icon
          v-if="topic.icon && topic.icon.name"
          left
          :size="24"
        >
          mdi-{{ topic.icon.name }}
        </v-icon>
        {{ topic.title }} <template v-if="topic.count">
          ({{ topic.count }})
        </template>
      </v-btn>
    </v-hover>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    topics: { type: Array, required: true },
    small: { type: Boolean, default: false },
    justify: { type: String, default: 'center' },
    rowClass: { type: String, default: 'my-3' }
  },
  computed: {
    ...mapGetters(['elevation', 'hoverInverse'])
  },
  methods: {
    style (topic, hover) {
      const color = this.$readableColor(topic.color)
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
