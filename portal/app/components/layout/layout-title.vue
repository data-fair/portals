<template>
  <component
    :is="titleTag"
    :id="anchorId"
    :class="[
      'd-flex align-center',
      element.centered ? 'justify-center' : undefined,
      element.bold ? 'font-weight-bold' : undefined,
      `text-${element.titleSize || 'h3'}`,
      anchorId ? 'page-title--anchored' : undefined
    ]"
    :style="anchorId ? 'scroll-margin-top: var(--toc-scroll-offset, 96px);' : undefined"
  >
    <!-- decorative <span>s instead of <v-divider>/<div> so the heading only contains phrasing content (HTML spec) -->
    <span
      v-if="element.line?.position === 'left'"
      class="d-block align-self-stretch mr-4"
      :style="{ borderLeft: `4px solid rgb(var(--v-theme-${element.line?.color}))` }"
      aria-hidden="true"
    />
    <v-icon
      v-if="element.icon && (element.icon.mdi?.svgPath || element.icon.custom)"
      :icon="element.icon.mdi?.svgPath || element.icon.custom"
      :color="element.icon.color"
      size="small"
      class="mr-4"
    />
    <span :class="['d-block', element.color ? `text-${element.color}` : undefined, element.centered ? 'text-center' : undefined]"><!--
      -->{{ element.content }}<!-- keep the copy button inline so it follows the last line of a wrapping title --><v-btn
        v-if="anchorId"
        :icon="copied ? mdiCheck : mdiLinkVariant"
        :title="copied ? t('linkCopied') : t('copyLink')"
        :aria-label="copied ? t('linkCopied') : t('copyLink')"
        variant="text"
        density="comfortable"
        size="small"
        class="page-anchor-btn ml-1"
        @click.prevent.stop="copyLink"
      /><span
        v-if="element.line?.position === 'bottom-small' || element.line?.position === 'bottom-medium'"
        :class="['d-block mt-2', element.centered ? 'mx-auto' : undefined]"
        :style="{
          borderBottom: `4px solid rgb(var(--v-theme-${element.line?.color}))`,
          width: element.line?.position === 'bottom-small' ? '80px' : '100%'
        }"
        aria-hidden="true"
      />
    </span>
  </component>

  <v-divider
    v-if="element.line?.position === 'bottom-large'"
    :style="{ borderColor: `rgb(var(--v-theme-${element.line?.color}))` }"
    class="border-opacity-100 mt-2"
    thickness="4"
    length="100%"
  />
</template>

<script setup lang="ts">
import { mdiLinkVariant, mdiCheck } from '@mdi/js'
import type { TitleElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: TitleElement }>()

const { t } = useI18n()

const titleTag = computed(() => element.titleTag ?? element.titleSize ?? 'h3')

const anchorId = computed(() => element.anchor?._slug || undefined)

const copied = ref(false)
let copiedTimeout: ReturnType<typeof setTimeout> | undefined
const copyLink = async () => {
  if (!anchorId.value) return
  const url = `${window.location.origin}${window.location.pathname}#${anchorId.value}`
  try {
    await navigator.clipboard.writeText(url)
    history.replaceState(null, '', '#' + anchorId.value)
    copied.value = true
    clearTimeout(copiedTimeout)
    copiedTimeout = setTimeout(() => { copied.value = false }, 1500)
  } catch { /* clipboard unavailable (insecure context) */ }
}

onUnmounted(() => clearTimeout(copiedTimeout))
</script>

<style scoped>
/* Vuetify 3 MD2 text-h1 to text-h6 compatibility classes */
/* cf https://vuetifyjs.com/en/getting-started/typography-migration/#restoring-md2-typography */
.text-h1 {
  font-size: 6rem !important;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -.015625em !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h2 {
  font-size: 3.75rem !important;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -.0083333333em !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h3 {
  font-size: 3rem !important;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: normal !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h4 {
  font-size: 2.125rem !important;
  font-weight: 400;
  line-height: 1.175;
  letter-spacing: .0073529412em !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h5 {
  font-size: 1.5rem !important;
  font-weight: 400;
  line-height: 1.333;
  letter-spacing: normal !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h6 {
  font-size: 1.25rem !important;
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: .0125em !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
/* Vuetify 4 moved .font-weight-bold into the `vuetify-utilities` cascade @layer and dropped its !important. */
.font-weight-bold {
  font-weight: 700 !important;
}
/* Reveal the copy-anchor button only when hovering/focusing the anchored title */
.page-anchor-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  vertical-align: middle;
}
.page-title--anchored:hover .page-anchor-btn,
.page-anchor-btn:focus-visible {
  opacity: 1;
}
</style>

<i18n lang="yaml">
  en:
    copyLink: Copy link to this section
    linkCopied: Link copied
  fr:
    copyLink: Copier le lien vers cette section
    linkCopied: Lien copié
</i18n>
