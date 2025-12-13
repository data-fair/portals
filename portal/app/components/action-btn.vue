<template>
  <!--
    class="justify-start" => Force left alignment of icon and text when actionLocation is 'right'
  -->
  <custom-router-link :to="to">
    <v-btn
      :icon="actionStyle === 'icon' ? icon : undefined"
      :prepend-icon="actionStyle === 'full' ? icon : undefined"
      :title="actionStyle === 'icon' ? text : undefined"
      :text="actionStyle !== 'icon' ? shortText || text : undefined"
      :density="actionStyle === 'icon' ? 'comfortable' : undefined"
      :size="actionStyle !== 'icon' ? 'small' : undefined"
      :block="block"
      class="justify-start"
      variant="text"
      v-bind="$attrs"
    />
  </custom-router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { DatasetCard } from '#api/types/portal/index.js'

defineProps<{
  /** Button destination */
  to?: RouteLocationRaw
  /** Button style */
  actionStyle: DatasetCard['actionsStyle']
  /** Button icon */
  icon: string
  /** Button text */
  text: string
  /** Button short text */
  shortText?: string
  /** Whether the button should take the full width of its container */
  block?: boolean
}>()

// allow passing fallthrough attributes to v-btn using $attrs
defineOptions({ inheritAttrs: false })
</script>
