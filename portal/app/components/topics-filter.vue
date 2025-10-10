<template>
  <v-row>
    <v-col
      v-for="topic in topics"
      :key="topic.id"
      cols="auto"
    >
      <v-btn
        :prepend-icon="topic.icon?.svgPath"
        :variant="!selected.includes(topic.id) ? 'outlined' : undefined"
        :color="topic.color"
        @click="toggle(topic.id)"
      >
        {{ topic.title }} ({{ topic.count }})
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

const selected = defineModel({
  type: Array as () => string[],
  default: () => []
})

const { topics } = defineProps<{
  topics: {
    id: string
    title: string
    count: number
    color: string
    icon?: {
      svgPath: string
    }
  }[]
}>()

const toggle = (id: string) => {
  if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
  else selected.value = [...selected.value, id]
}

</script>
