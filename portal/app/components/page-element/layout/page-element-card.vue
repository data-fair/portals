<!-- eslint-disable vue/v-bind-style -->
<template>
  <!-- d-flex align-center flex-grow-1 is used with two columns stretch -->
  <!--
    Note that the `title` prop overrides the native `title` attribute,
    which must be set using `v-bind:title.attr` instead.
    See https://vuetifyjs.com/en/api/v-list-item/#props
  -->
  <v-card
    :to="!preview && element.link && !isExternalLink(element.link) ? resolveLink(element.link) : undefined"
    :href="!preview && element.link && isExternalLink(element.link) ? resolveLink(element.link) : undefined"
    :target="element.link?.target ? '_blank' : undefined"
    :rel="element.link?.target ? 'noopener' : undefined"
    v-bind:title.attr="element.link && element.title ? (element.title + (element.link?.target ? ' - ' + t('newWindow') : '')) : undefined"

    :border="element.border"
    :elevation="element.elevation"
    :rounded="element.rounded"
    :variant="element.background?.tonal ? 'tonal' : undefined"
    :class="[element.mb !== 0 && `mb-${element.mb ?? 4}`, 'd-flex flex-column flex-grow-1']"
    :color="element.background?.color"
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

const { t } = useI18n()
const { element } = defineProps({
  element: { type: Object as () => CardElement, required: true }
})

const { preview, portalConfig } = usePortalStore()
const { isExternalLink, resolveLink } = useNavigationStore()
const getPageImageSrc = usePageImageSrc()

</script>

<i18n lang="yaml">
  en:
    newWindow: New window
  fr:
    newWindow: Nouvelle fenêtre
</i18n>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-btn__content) {
  max-width: 100%;
  min-width: 0; /* needed for btn but not for chip ?!! */
}
</style>
