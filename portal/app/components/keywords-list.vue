<template>
  <v-row
    v-if="keywords.length"
    dense
  >
    <v-col
      v-for="keyword in keywords"
      :key="keyword"
      cols="auto"
    >
      <v-chip
        variant="outlined"
        :color="config?.color"
        :density="config?.density"
        :elevation="config?.elevation"
        :rounded="config?.rounded"
        :text="keyword"
        label
      >
        <span class="text-truncate">{{ keyword }}</span>
      </v-chip>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { TopicsElement } from '#api/types/page-config/index.js'

const { keywords } = defineProps<{
  keywords: string[]
  config?: Pick < TopicsElement, 'color' | 'elevation' | 'density' | 'rounded'>
}>()

</script>

<style scoped>
/* Set a background color for outlined chips */
:deep(.v-chip--variant-outlined) {
  background-color: var(--v-theme-surface);
}

/* Allow to truncate text */
:deep(.v-chip__content) {
  max-width: 100%;
}
</style>
