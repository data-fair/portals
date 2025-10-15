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
import type { PageElement, Banner, ImageRef } from '#api/types/page-config'

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

<style lang="scss" scoped>
@use 'sass:map';
@use 'vuetify/settings' as v;

// When the screen is exactly 1280px (xl threshold), keep the lg width
.container {
  $xl-threshold: map.get(v.$grid-breakpoints, 'xl') + 1px;

  @media (max-width: #{$xl-threshold}) {
    max-width: map.get(v.$grid-breakpoints, 'lg') !important;
  }
}
</style>
