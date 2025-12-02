<template>
  <v-pagination
    v-if="totalPages > 1"
    :model-value="currentPage"
    :length="totalPages"
    :total-visible="$vuetify.display.smAndDown ? 5 : 7"
    :class="alignmentClass"
    @update:model-value="$emit('update:page', $event)"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  alignment?: 'left' | 'center' | 'right'
}>()

defineEmits<{
  'update:page': [page: number]
}>()

const alignmentClass = computed(() => {
  if (props.alignment === 'left') return 'd-flex justify-start'
  if (props.alignment === 'right') return 'd-flex justify-end'
  return 'd-flex justify-center'
})
</script>
