<template>
  <!--
    The card itself must not be an <a>: its content holds links (action buttons,
    navigation links, markdown), and an anchor inside an anchor makes the parser
    hoist the card content out and clone it. This overlay covers the card as a
    sibling of that content instead, so every inner link stays valid.

    Zones meant to escape the card link (action bars) sit above it with
    position-relative + z-index.
  -->
  <a
    v-if="href"
    :href="href"
    :aria-label="label"
    :title="title"
    :target="target ? '_blank' : undefined"
    :rel="target ? 'noopener' : undefined"
    class="position-absolute card-overlay-link"
    style="inset: 0"
  />
  <NuxtLink
    v-else-if="to"
    :to="to"
    :aria-label="label"
    :title="title"
    :target="target ? '_blank' : undefined"
    :rel="target ? 'noopener' : undefined"
    class="position-absolute card-overlay-link"
    style="inset: 0"
  />
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  /** Internal destination, rendered as a NuxtLink */
  to?: RouteLocationRaw
  /** External destination, rendered as a plain anchor */
  href?: string
  /** Accessible name of the card link, usually the resource title */
  label: string
  /** Native tooltip, when the card is meant to show one */
  title?: string
  /** Open in a new window */
  target?: boolean
}>()
</script>

<style scoped>
/* The overlay is exactly the size of the card, whose overflow is hidden, so the
   focus ring would be drawn outside and clipped away. Pulling it inside keeps the
   browser's native ring — and its forced-colors behaviour — while making it visible. */
.card-overlay-link:focus-visible {
  outline-offset: -3px;
}
</style>
