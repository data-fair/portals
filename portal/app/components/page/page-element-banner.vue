<template>
  <!-- d-flex align-center flex-grow-1 is used with two columns stretch -->
  <v-sheet
    :class="[
      !preview && element.fullWidth && context.isRoot ? 'banner-fluid' : 'banner-container',
      element.background?.color && 'bg-' + element.background.color,
      !preview && context.isRoot && context.index === 0 && !showBreadcrumbs('top') && 'mt-n4',
      !preview && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
      element.mb !== 0 && `mb-${element.mb ?? 4}`,
      !preview && element.overflowTop && `mt-n${element.pt ?? 4}`,
      !preview && element.overflowBottom && `mb-n${element.pb ?? 4}`,
      'd-flex align-center flex-grow-1'
    ]"
    :style="element.background && element.background.image ? {
      backgroundImage: element.background.tintStrength
    ? `linear-gradient(rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength}), rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength})), url(${getPageImageSrc(element.background.image, false)})`
    : `url(${getPageImageSrc(element.background.image, false)})`,
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
const getPageImageSrc = usePageImageSrc()

// Calculate scrollbar width to adjust full width banners
// By default 100vw includes scrollbar width
if (typeof window !== 'undefined') {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
}

// If breadcrumbs are displayed and the banner is at the top, don't apply the negative margin.
const { showBreadcrumbs } = useNavigationStore()

</script>

<style scoped>

:root { --scrollbar-width: 0px; }

.banner-fluid {
  width: calc(100vw - var(--scrollbar-width, 0px));
  margin-left: calc(50% - 50vw + var(--scrollbar-width, 0px) / 2);
}

.banner-contained { width: 100%; }
</style>
