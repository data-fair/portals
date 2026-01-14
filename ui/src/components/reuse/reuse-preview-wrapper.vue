<template>
  <portal-preview-provider>
    <reuse-preview
      v-if="reuseConfig"
      :reuse-config="reuseConfig"
      :slug="slug"
      :show-back-link="false"
    />
  </portal-preview-provider>
</template>

<script setup lang="ts">
import type { ReuseConfig } from '#api/types/reuse-config'

const { reuseConfig, slug } = defineProps<{
  reuseConfig: ReuseConfig
  slug: string
}>()

</script>
