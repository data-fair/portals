<template>
  <v-row v-if="items.length">
    <v-chip
      v-for="topicItem in items"
      :key="topicItem.value.id"
      :color="topicItem.value.color ? $readableColor(topicItem.value.color) : 'default'"
      label
      dark
      class="ml-3 my-1 font-weight-bold"
      :class="{'elevation-8' : topicItem.filtered}"
      @click="$emit('toggle', topicItem.value)"
    >
      {{ topicItem.value.title }} ({{ topicItem.count }})
      <v-icon
        v-if="topicItem.filtered"
        class="ml-1"
      >
        mdi-filter-variant
      </v-icon>
    </v-chip>
  </v-row>
</template>

<script>
export default {
  props: {
    items: { type: Array, required: true }
  }
}
</script>

<style>

</style>
