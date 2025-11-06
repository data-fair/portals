<template>
  <div :class="element.centered && 'd-flex justify-center'">
    <nav-link
      v-if="element.link"
      :link="element.link"
      :config="(!element.usePortalConfig && element.config) ? element.config : portalConfig.navLinksConfig"
      :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    />
  </div>
</template>

<script setup lang="ts">
import type { ButtonElement } from '#api/types/page-elements'

const { element } = defineProps<{ element: ButtonElement }>()
const { portalConfig } = usePortalStore()

</script>
