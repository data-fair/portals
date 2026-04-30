<template>
  <!--
    class="justify-start" => Force left alignment of icon and text when actionLocation is 'right'
  -->
  <v-btn
    :to="to"
    :icon="actionStyle === 'icon' ? icon : undefined"
    :prepend-icon="actionStyle === 'full' ? icon : undefined"
    :title="tooltip || text"
    :aria-label="resourceTitle ? resourceTitle + ' - ' + (tooltip || text) : (tooltip || text)"
    :text="actionStyle !== 'icon' ? text : undefined"
    :density="actionStyle === 'icon' ? 'comfortable' : undefined"
    :size="actionStyle !== 'icon' ? 'small' : undefined"
    :block="block"
    :class="{ 'justify-start': actionStyle !== 'icon' }"
    class="text-uppercase"
    variant="text"
  />
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { DatasetCard } from '#api/types/portal/index.js'

defineProps<{
  /** Button destination */
  to?: RouteLocationRaw
  /** Button style */
  actionStyle?: DatasetCard['actionsStyle']
  /** Button icon */
  icon: string
  /** Resource title */
  resourceTitle?: string
  /** Short button label (always shown when actionStyle !== 'icon') */
  text: string
  /** Longer descriptive text used for the native tooltip and aria-label */
  tooltip?: string
  /** Whether the button should take the full width of its container */
  block?: boolean
}>()

</script>
