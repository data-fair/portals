<template>
  <div class="banner-wrapper">
    <div
      :class="[
        preview || !context.isRoot || !element.background?.fullWidth ? 'banner-contained' : 'banner-fluid',
        element.background?.color && 'bg-' + element.background?.color,
        !preview && element.sticky && context.isRoot && context.index === 0 && 'mt-n4',
        !preview && element.sticky && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
        element.mb !== 0 && `mb-${element.mb ?? 4}`
      ]"
      :style="backgroundStyle"
    />
    <v-container :style="'position: relative; z-index: 1;' + navigationTextStyle" class="pt-12">
      <slot
        name="page-elements"
        :on-update="(newElements: PageElement[]) => ({ ...element, childrenMain: newElements })"
        :elements="element.childrenMain"
        add-item-message="Ajouter un bloc au contenu principal"
      />
    </v-container>
  </div>
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

// Style pour l'image de fond
const backgroundStyle = computed(() => {
  const style: Record<string, string> = {}

  if (element.background?.image) {
    const imageUrl = `/api/v1/portals/${useRoute().params.portalId}/images/${element.background.image._id}`
    style.backgroundImage = `url(${imageUrl})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.backgroundRepeat = 'no-repeat'
  }

  style.position = 'absolute'
  style.zIndex = '0'

  if (element.height) {
    style['--height'] = `${element.height}px`
  }
  if (element.mobileHeight) {
    style['--mobile-height'] = `${element.mobileHeight}px`
  }

  return style
})

const navigationTextStyle = computed(() => {
  return `color: rgba(var(--v-theme-on-${element.background?.color}));`
})

</script>

<style scoped>
.banner-wrapper {
  position: relative;
}

.banner-fluid,
.banner-contained {
  position: absolute;
  top: 0;
  z-index: 0;
}

.banner-fluid {
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  height: var(--height)
}

.banner-contained {
  left: 0;
  width: 100%;
  height: var(--height);
}

/* Appliquer mobileHeight sur mobile si défini */
@media (max-width: 599px) {
  .banner-fluid,
  .banner-contained {
    height: var(--mobile-height);
  }
}
</style>
