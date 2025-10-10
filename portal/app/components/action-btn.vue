<template>
  <v-btn
    :to="to"
    :icon="actionStyle === 'icon' ? icon : undefined"
    :prepend-icon="actionStyle === 'full' ? icon : undefined"
    :title="actionStyle === 'icon' ? text : undefined"
    :text="actionStyle !== 'icon' ? shortText || text : undefined"
    :density="actionStyle === 'icon' ? 'comfortable' : undefined"
    :size="actionStyle !== 'icon' ? 'small' : undefined"
    variant="text"
  />
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal/index.js'

defineProps<{
  /** Button destination */
  to?: string
  /** Button style */
  actionStyle: PortalConfig['datasets']['actionStyle']
  /** Button icon */
  icon: string
  /** Button text */
  text: string
  /** Button short text */
  shortText?: string
}>()

</script>
