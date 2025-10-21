<!-- eslint-disable vue/no-v-html -->
<template>
  <v-sheet
    :class="[
      'banner-fluid',
      element.backgroundColor ? 'bg-' + element.backgroundColor : undefined
    ]"
    :style="src ? {
      backgroundImage: `url(${src})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    } : {}"
    fluid
  >
    <v-container class="container">
      <slot
        name="page-elements"
        :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
        :elements="element.children"
        add-item-message="Ajouter un bloc à la bannière"
      />
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import type { PageElement, ImageRef } from '#api/types/page-config'

// TODO: replace with import from types when available
type Banner = {
  type: 'banner'
  backgroundColor?: string
  backgroundImage?: ImageRef
  children: PageElement[]
}

const { element } = defineProps({
  element: { type: Object as () => Banner, required: true }
})

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const src = computed(() => {
  if (!element.backgroundImage) return
  return getImageSrc(element.backgroundImage, false)
})

</script>

<style scoped>
.banner-fluid {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
</style>
