<!-- eslint-disable vue/no-v-html -->
<template>
  <v-sheet
    :class="[
      preview || !context.isRoot ? 'banner-contained' : 'banner-fluid',
      element.color && 'bg-' + element.color,
      !preview && context.isRoot && context.index === 0 && 'mt-n4',
      !preview && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
      element.mb !== 0 && `mb-${element.mb ?? 4}`,
      element.overflowTop && `mt-n${element.pt ?? 4}`,
  element.overflowBottom && `mb-n${element.pb ?? 4}`
    ]"
    :style="element.image ? {
      backgroundImage: `url(${getImageSrc(element.image, false)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: element.color ? `rgba(var(--v-theme-${element.color}), ${(element.overlayStrength || 40) / 100}) !important` : undefined,
      backgroundBlendMode: 'multiply'
    } : undefined"
  >
    <v-container
      :class="['container', 'pt-' + (element.pt ?? 4), 'pb-' + (element.pb ?? 4)]"
    >
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
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageElement, BannerElement } from '#api/types/page-config'

const { element } = defineProps<{
  element: BannerElement
  context: {
    isRoot: boolean
    index: number
    parentLength: number
  }
}>()

const { preview } = usePortalStore()
const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

</script>

<style scoped>
.banner-fluid {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

.banner-contained {
  width: 100%;
}

.banner-overlay {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
</style>
