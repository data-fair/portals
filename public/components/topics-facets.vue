<template>
  <v-row v-if="items.length">
    <v-col>
      <v-hover
        v-for="topicItem in items"
        :key="topicItem.value.id"
        v-slot="{hover}"
      >
        <v-btn
          class="mr-3 mb-1 font-weight-bold text-none"
          dark
          rounded
          depressed
          :elevation="elevation"
          :style="style(topicItem, hover)"
          @click="$emit('toggle', topicItem.value)"
        >
          <v-icon
            v-if="topicItem.value.icon && topicItem.value.icon.name"
            left
            :size="24"
          >
            mdi-{{ topicItem.value.icon.name }}
          </v-icon>
          {{ topicItem.value.title }} ({{ topicItem.count }})
        </v-btn>
      </v-hover>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    items: { type: Array, required: true }
  },
  computed: {
    ...mapGetters(['elevation', 'hoverInverse'])
  },
  methods: {
    style (topicItem, hover) {
      const color = this.$readableColor(topicItem.value.color)
      if ((!topicItem.filtered && !(hover && this.hoverInverse)) || (topicItem.filtered && hover && this.hoverInverse)) {
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

<style>

</style>
