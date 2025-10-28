<!-- eslint-disable vue/no-v-html -->
<template>
  <v-card
    :border="element.border"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :color="element.background?.color"
    :href="!preview ? element.href : undefined"
    :title="element.title"
    :style="element.background && element.background.image ? {
      backgroundImage: element.background.tintStrength
        ? `linear-gradient(rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength}), rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength})), url(${getImageSrc(element.background.image, false)})`
        : `url(${getImageSrc(element.background.image, false)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : undefined"
  >
    <v-card-text>
      <slot
        name="page-elements"
        :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
        :elements="element.children"
        add-item-message="Ajouter un bloc à la boite"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-for="(action, i) in element.actions"
        :key="i"
        :href="action.href"
        :color="action.color"
        variant="outlined"
      >
        <template #prepend>
          <v-icon
            v-if="action.icon"
            :icon="action.icon.mdi?.svgPath || action.icon.custom"
            :color="action.icon.color"
          />
        </template>
        {{ action.label }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageElement, Boite } from '~~/../api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Boite, required: true }
})

const { preview } = usePortalStore()
const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

</script>
