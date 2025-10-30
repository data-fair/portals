<!-- eslint-disable vue/no-v-html -->
<template>
  <!-- d-flex align-center flex-grow-1 is used with two columns stretch-->
  <v-sheet
    :class="[
      preview || !context.isRoot ? 'banner-contained' : 'banner-fluid',
      element.background?.color && 'bg-' + element.background.color,
      !preview && context.isRoot && context.index === 0 && 'mt-n4',
      !preview && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
      element.mb !== 0 && `mb-${element.mb ?? 4}`,
      !preview && element.overflowTop && `mt-n${element.pt ?? 4}`,
      !preview && element.overflowBottom && `mb-n${element.pb ?? 4}`,
      'd-flex align-center flex-grow-1'
    ]"
    :style="element.background && element.background.image ? {
      backgroundImage: element.background.tintStrength
    ? `linear-gradient(rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength}), rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength})), url(${getImageSrc(element.background.image, false)})`
    : `url(${getImageSrc(element.background.image, false)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : undefined"
  >
    <v-container :class="['container', 'pt-' + (element.pt ?? 4), 'pb-' + (element.pb ?? 4), 'pl-' + (element.pl ?? 4), 'pr-' + (element.pr ?? 4)]">
      <slot
        name="page-elements"
        :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
        :elements="element.children"
        add-item-message="Ajouter un bloc à la section"
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
</style>
