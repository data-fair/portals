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
        :variant="(!config?.variant || config.variant === 'default') ? 'flat' : config.variant"
        :color="config?.color"
        :density="config?.density"
        :elevation="config?.elevation"
        :rounded="config?.rounded"
        :text="keyword"
        class="bg-surface"
        label
      >
        <!-- text-truncate enables text overflow with ellipsis (...) when chip width exceeds available space -->
        <span class="text-truncate">{{ keyword }}</span>
      </v-chip>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { KeywordsConfig } from '#api/types/portal-config/index.ts'

const { keywords } = defineProps<{
  keywords: string[]
  config?: Pick<KeywordsConfig, 'color' | 'elevation' | 'density' | 'rounded' | 'variant'>
}>()

</script>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-chip__content) {
  max-width: 100%;
}
</style>
