<template>
  <div>
    <v-sheet
      :class="[
        preview || !context.isRoot || !element.background?.fullWidth ? 'banner-contained' : 'banner-fluid',
        element.background?.color && 'bg-' + element.background?.color,
        !preview && element.sticky && context.isRoot && context.index === 0 && 'mt-n4',
        !preview && element.sticky && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
        element.mb !== 0 && `mb-${element.mb ?? 4}`
      ]"
      :style="backgroundStyle"
      fluid
    >
      <v-container>
        <!-- Children overflow top - déborde vers le haut -->
        <div v-if="element.childrenOverflowTop && element.childrenOverflowTop.length > 0">
          <slot
            name="page-elements"
            :on-update="(newElements: PageElement[]) => ({ ...element, childrenOverflowTop: newElements })"
            :elements="element.childrenOverflowTop"
            add-item-message="Ajouter un bloc flottant en haut"
          />
        </div>

        <!-- Children main - avec alignement vertical et hauteur min -->
        <div :style="mainContentStyle">
          <slot
            name="page-elements"
            :on-update="(newElements: PageElement[]) => ({ ...element, childrenMain: newElements })"
            :elements="element.childrenMain"
            add-item-message="Ajouter un bloc au contenu principal"
          />
        </div>

        <!-- Children overflow bottom - déborde vers le bas -->
        <div v-if="element.childrenOverflowBottom && element.childrenOverflowBottom.length > 0">
          <slot
            name="page-elements"
            :on-update="(newElements: PageElement[]) => ({ ...element, childrenOverflowBottom: newElements })"
            :elements="element.childrenOverflowBottom"
            add-item-message="Ajouter un bloc flottant en bas"
          />
        </div>
      </v-container>
    </v-sheet>

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

  return style
})

// Style pour le contenu principal (hauteur min)
const mainContentStyle = computed(() => {
  const style: Record<string, string> = {}

  if (element.height) {
    style.minHeight = `${element.height}px`
  }

  return style
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
