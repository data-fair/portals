<template>
  <v-row v-if="items.length">
    <v-col>
      <v-hover
        v-for="topicItem in items"
        :key="topicItem.value.id"
        v-slot="{hover}"
      >
        <v-btn
          :color="topicItem.value.color ? $readableColor(topicItem.value.color) : 'default'"
          class="mr-3 mb-1 font-weight-bold text-none"
          dark
          rounded
          depressed
          :elevation="elevation"
          :outlined="(!topicItem.filtered && !(hover && hoverInverse)) || (topicItem.filtered && hover && hoverInverse)"
          :style="(hover && hoverInverse) || topicItem.filtered ? '' : 'background-color:white'"
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
  }
}
</script>

<style>

</style>
