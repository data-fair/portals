<!-- eslint-disable vue/no-v-html -->
<template>
  <v-sheet
    :class="[
      preview || !context.isRoot ? 'banner-contained' : 'banner-fluid',
      element.backgroundColor && 'bg-' + element.backgroundColor,
      element.sticky && context.isRoot && context.index === 0 && 'mt-n4',
      element.sticky && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
      element.mb !== 0 && `mb-${element.mb ?? 4}`
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
import type { PageElement, ImageRef, Banner } from '#api/types/page-config'

const { element } = defineProps<{
  element: Banner
  context: {
    isRoot: boolean
    index: number
    parentLength: number
  }
}>()

const { preview } = usePortalStore()

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

.banner-contained {
  width: 100%;
}
</style>
