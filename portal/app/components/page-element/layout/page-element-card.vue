<template>
  <!-- d-flex align-center flex-grow-1 is used with two columns stretch -->
  <v-card
    :border="element.border"
    :elevation="element.elevation"
    :rounded="element.rounded"
    :variant="element.background?.tonal ? 'tonal' : undefined"
    :class="[element.mb !== 0 && `mb-${element.mb ?? 4}`, 'd-flex flex-column flex-grow-1']"
    :color="element.background?.color"
    :href="!preview ? element.href : undefined"
    :style="element.background && element.background.image ? {
      backgroundImage: element.background.tintStrength
        ? `linear-gradient(rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength}), rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength})), url(${getPageImageSrc(element.background.image, false)})`
        : `url(${getPageImageSrc(element.background.image, false)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : undefined"
  >
    <v-card-title v-if="element.title">
      {{ element.title }}
    </v-card-title>
    <v-spacer />
    <v-card-text class="flex-grow-0">
      <slot
        name="page-elements"
        :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
        :elements="element.children"
        add-item-message="Ajouter un bloc à la boite"
      />
    </v-card-text>
    <v-spacer />
    <!--
      min-height: auto => remove default v-card-actions min-height
    -->
    <v-card-actions
      v-if="element.actions.length"
      style="min-height: auto"
    >
      <!-- Reset default btn styles apply by v-card-actions -->
      <v-defaults-provider
        :defaults="{
          VBtn: {
            variant: 'flat',
            slim: false
          }
        }"
      >
        <nav-link
          v-for="(action, i) in element.actions"
          :key="i"
          :link="action"
          :config="(!element.actionStyle?.usePortalConfig && element.actionStyle?.config) ? element.actionStyle.config : portalConfig.navLinksConfig"
        />
      </v-defaults-provider>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { PageElement, CardElement } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => CardElement, required: true }
})

const { preview, portalConfig } = usePortalStore()
const getPageImageSrc = usePageImageSrc()

</script>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-btn__content) {
  max-width: 100%;
  min-width: 0; /* needed for btn but not for chip ?!! */
}
</style>
