<template>
  <!-- d-flex align-center flex-grow-1 is used with two columns stretch -->
  <v-sheet
    :class="[
      !preview && element.fullWidth && context.isRoot ? 'banner-fluid' : '',
      element.background?.color && 'bg-' + element.background.color,
      !preview && context.isRoot && context.index === 0 && !showTopBreadcrumbs && 'mt-n4',
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
    <v-container :class="[{ 'container': !pageConfig?.fluid }, 'pt-' + (element.pt ?? 4), 'pb-' + (element.pb ?? 4), 'pl-' + (element.pl ?? 4), 'pr-' + (element.pr ?? 4)]">
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
import type { PageElement, BannerElement, PageConfig } from '#api/types/page-config'

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
// If breadcrumbs are displayed and the banner is at the top, don't apply the negative margin.
const { showTopBreadcrumbs } = useNavigationStore()
const pageConfig = inject<Ref<PageConfig>>('page-config')

</script>

<style scoped>
.banner-fluid {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
</style>
