<template>
  <v-row v-if="items.length">
    <v-col>
      <v-chip
        v-for="topicItem in items"
        :key="topicItem.value.id"
        :color="topicItem.value.color ? $readableColor(topicItem.value.color) : 'default'"
        label
        dark
        class="mr-3 mb-1 font-weight-bold"
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
    </v-col>
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
