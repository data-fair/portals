<template>
  <!-- d-flex align-center flex-grow-1 is used with two columns stretch -->
  <v-card
    ref="card"
    :to="!preview && element.link && element.link.type !== 'none' && !isExternalLink(element.link) ? resolveLink(element.link) : undefined"
    :href="!preview && element.link && element.link.type !== 'none' && isExternalLink(element.link) ? resolveLink(element.link) : undefined"
    :target="element.link && element.link.type !== 'none' && element.link?.target ? '_blank' : undefined"
    :rel="element.link && element.link.type !== 'none' && element.link?.target ? 'noopener' : undefined"

    :border="element.border"
    :rounded="element.rounded ?? portalConfig.defaults?.rounded"
    :elevation="element.elevation ?? portalConfig.defaults?.elevation"
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

    <!--
      flex-nowrap => prevent the left thumbnail column from wrapping
      no-gutters => remove spaces between columns
      flex-grow-1 => let the row fill the card height so the left image stretches
    -->
    <v-row
      class="flex-nowrap flex-grow-1"
      no-gutters
    >
      <!-- Thumbnail (Left Location) -->
      <!-- On mobile, fall back to the top location (see main column below) -->
      <template v-if="element.thumbnail?.location === 'left' && element.thumbnail?.image && !$vuetify.display.smAndDown">
        <v-col cols="4">
          <div
            aria-hidden="true"
            :style="leftThumbnailStyle"
          />
        </v-col>
        <v-divider vertical />
      </template>

      <!--
        d-flex flex-column => keep the vertical layout and the working v-spacers
        min-width: 0 => allow the column to shrink below its content width
      -->
      <v-col
        class="d-flex flex-column"
        style="min-width: 0"
      >
        <!-- Thumbnail (Top Location), also used as mobile fallback for 'left' -->
        <div
          v-if="(element.thumbnail?.location === 'top' || (element.thumbnail?.location === 'left' && $vuetify.display.smAndDown)) && element.thumbnail?.image"
          aria-hidden="true"
          class="flex-grow-0"
        >
          <v-img
            :src="getPageImageSrc(element.thumbnail.image, false)"
            :cover="element.thumbnail.crop"
            height="170"
            alt=""
          />
        </div>

        <!--
          white-space: unset; => remove default nowrap from v-card-title
        -->
        <v-card-title
          v-if="element.title"
          class="font-weight-bold"
          style="white-space: unset;"
        >
          {{ element.title }}
        </v-card-title>

        <!-- Thumbnail (Center Location) -->
        <div
          v-if="element.thumbnail?.location === 'center' && element.thumbnail?.image"
          aria-hidden="true"
          class="flex-grow-0"
        >
          <v-img
            :src="getPageImageSrc(element.thumbnail.image, false)"
            :cover="element.thumbnail.crop"
            height="170"
            alt=""
          />
        </div>

        <!--
          v-spacer works with "two columns stretch" layout
          no contentAlign falls back to 'center' for backward compatibility.
        -->
        <v-spacer v-if="!element.contentAlign || element.contentAlign === 'center' || element.contentAlign === 'end'" />

        <v-card-text class="flex-grow-0">
          <slot
            name="page-elements"
            :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
            :elements="element.children"
            add-item-message="Ajouter un bloc à la boite"
          />
        </v-card-text>

        <v-spacer v-if="!element.contentAlign || element.contentAlign === 'center' || element.contentAlign === 'start'" />

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
      </v-col>
    </v-row>

  </v-card>
</template>

<script setup lang="ts">
import type { PageElement, CardElement } from '#api/types/page-elements/index.ts'

const { t } = useI18n()
const { element } = defineProps({
  element: { type: Object as () => CardElement, required: true }
})

const { preview, portalConfig } = usePortalStore()
const { isExternalLink, resolveLink } = useNavigationStore()
const getPageImageSrc = usePageImageSrc()

// Background-image style for the left thumbnail column so it fills the card height.
const leftThumbnailStyle = computed(() => {
  if (!element.thumbnail?.image) return undefined
  return {
    backgroundImage: `url("${getPageImageSrc(element.thumbnail.image, false)}")`,
    backgroundSize: element.thumbnail.crop ? 'cover' : 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '200px',
    height: '100%'
  }
})

const altLinkTitle = computed(() => {
  if (!element.link || element.link.type === 'none') return ''
  let linkTitle = element.link?.title || element.title || ''
  if (element.link?.target) linkTitle += ' - ' + t('newWindow')
  return linkTitle
})

// v-bind:title.attr causes SSR hydration mismatch with Vuetify 4
// (title is interpreted as v-card prop in SSR, creating an extra v-card-item)
const card = useTemplateRef('card')
watchEffect(() => {
  const el = card.value?.$el
  if (!el) return
  if (altLinkTitle.value) {
    el.setAttribute('title', altLinkTitle.value)
  } else {
    el.removeAttribute('title')
  }
})

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
