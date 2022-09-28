<template>
  <v-row v-if="items.length">
    <v-col>
      <v-btn
        v-for="topicItem in items"
        :key="topicItem.value.id"
        :color="topicItem.value.color ? $readableColor(topicItem.value.color) : 'default'"
        dark
        rounded
        :elevation="elevation"
        :outlined="!topicItem.filtered"
        class="mr-3 mb-1 font-weight-bold text-none"
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
    ...mapGetters(['elevation'])
  }
}
</script>

<style>

</style>
