<template>
  <!-- d-flex align-center flex-grow-1 is used with two columns stretch -->
  <!-- disabled => hover effects only apply when the box is a link -->
  <v-card
    v-bind="hoverProps"
    :link="hoverable"
    :border="element.border"
    :rounded="element.rounded ?? portalConfig.defaults?.rounded"
    :elevation="hoverFx.elevation(isHovering, element.elevation ?? portalConfig.defaults?.elevation)"
    :variant="element.background?.tonal ? 'tonal' : undefined"
    :class="[element.mb !== 0 && `mb-${element.mb ?? 4}`, 'd-flex flex-column flex-grow-1']"
    :color="hoverFx.background(isHovering, element.background?.color)"
    :style="[element.background && element.background.image ? {
      backgroundImage: element.background.tintStrength
        ? `linear-gradient(rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength}), rgba(var(--v-theme-${element.background.color}) ,${element.background.tintStrength})), url(${getPageImageSrc(element.background.image, false)})`
        : `url(${getPageImageSrc(element.background.image, false)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : undefined, hoverFx.rootStyle(isHovering, { hasBorder: !!element.border })]"
  >
    <!--
      The box holds arbitrary user content, so its own link must never wrap it:
      an action button or a markdown link inside would be an anchor in an anchor.
    -->
    <card-overlay-link
      v-if="!preview && boxLink"
      :to="boxLink.to"
      :href="boxLink.href"
      :target="boxLink.target"
      :label="altLinkTitle"
      :title="altLinkTitle"
    />

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
        <v-col cols="4" class="overflow-hidden">
          <div
            aria-hidden="true"
            :style="[leftThumbnailStyle, hoverFx.imageStyle(isHovering)]"
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
          class="flex-grow-0 overflow-hidden"
        >
          <v-img
            :src="getPageImageSrc(element.thumbnail.image, false)"
            :cover="element.thumbnail.crop"
            height="170"
            alt=""
            :style="hoverFx.imageStyle(isHovering)"
          />
        </div>

        <!--
          white-space: unset; => remove default nowrap from v-card-title
        -->
        <v-card-title
          v-if="element.title"
          class="font-weight-bold"
          :style="[{ 'white-space': 'unset' }, hoverFx.titleStyle(isHovering)]"
        >
          {{ element.title }}
        </v-card-title>
        <span
          v-if="hoverFx.hasUnderlineBar.value && hoverable && element.title"
          class="mx-4"
          :style="hoverFx.underlineBarStyle(isHovering)"
          aria-hidden="true"
          data-pt-hover-underline
        />

        <!-- Thumbnail (Center Location) -->
        <div
          v-if="element.thumbnail?.location === 'center' && element.thumbnail?.image"
          aria-hidden="true"
          class="flex-grow-0 overflow-hidden"
        >
          <v-img
            :src="getPageImageSrc(element.thumbnail.image, false)"
            :cover="element.thumbnail.crop"
            height="170"
            alt=""
            :style="hoverFx.imageStyle(isHovering)"
          />
        </div>

        <!--
          v-spacer works with "two columns stretch" layout
          no contentAlign falls back to 'center' for backward compatibility.
        -->
        <v-spacer v-if="!element.contentAlign || element.contentAlign === 'center' || element.contentAlign === 'end'" />

        <!--
          box-content => lifts the interactive children (markdown links, buttons)
          above the card link overlay so they stay clickable
        -->
        <v-card-text class="flex-grow-0 box-content">
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
          position-relative + z-index => sit above the card link overlay, so this
          strip is not part of the box link and only its buttons are clickable
        -->
        <v-card-actions
          v-if="element.actions.length"
          class="position-relative"
          style="min-height: auto; z-index: 1"
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
const hoverFx = useHoverConfig(() => element.hover)
const { isHovering, hoverProps } = useHoverState(() => hoverable.value)
const hoverable = computed(() => !!element.link && element.link.type !== 'none')

const boxLink = computed(() => {
  if (!element.link || element.link.type === 'none') return undefined
  const resolved = resolveLink(element.link)
  const external = isExternalLink(element.link)
  return {
    href: external ? resolved : undefined,
    to: external ? undefined : resolved,
    target: !!element.link.target
  }
})

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

</script>

<i18n lang="yaml">
  en:
    newWindow: New window
  fr:
    newWindow: Nouvelle fenêtre
</i18n>

<style scoped>
/* The box link covers the card, so its interactive children need to come back on
   top to stay clickable. Children are user content (markdown included), hence the
   descendant selector rather than a class on each of them. */
.box-content :deep(a),
.box-content :deep(button) {
  position: relative;
  z-index: 1;
}
</style>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-btn__content) {
  max-width: 100%;
  min-width: 0; /* needed for btn but not for chip ?!! */
}
</style>
