<template>
  <!--
    text-two-lines => clamp the title to 2 lines
    wrapper reserves 2 title lines (text-title-large sets the line box) so the
    hover underline hugs the text even when the title fits on a single line
  -->
  <div
    class="text-title-large"
    :class="{ 'my-2': linesCount === 2 }"
    :style="linesCount === 2 ? { minHeight: '2lh' } : undefined"
  >
    <v-card-title
      :class="['font-weight-bold', { 'text-two-lines py-0': linesCount === 2 }]"
      :style="[linesCount === 0 ? { 'white-space': 'unset' } : undefined, hoverFx.titleStyle(isHovering)]"
      :title="title"
    >
      {{ title }}
    </v-card-title>
    <span
      v-if="hoverFx.hasUnderlineBar.value"
      class="mx-4"
      :style="hoverFx.underlineBarStyle(isHovering)"
      aria-hidden="true"
      data-pt-hover-underline
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  linesCount?: number
  hoverFx: ReturnType<typeof useHoverConfig>
  isHovering: boolean | null
}>()
</script>
