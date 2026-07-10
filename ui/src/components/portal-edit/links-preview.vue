<template>
  <preview>
    <p class="mb-0">
      {{ t('sampleText') }}
      <v-hover v-slot="{ isHovering, props: hoverProps }">
        <a
          v-bind="hoverProps"
          href="#"
          class="simple-link"
          :style="linkStyle(isHovering)"
          @click.prevent
        >{{ t('sampleLink') }}<span
          v-if="config?.underline === 'hover-grow'"
          :style="barStyle(isHovering)"
          aria-hidden="true"
        /></a>
      </v-hover>
      {{ t('sampleTextEnd') }}
    </p>
  </preview>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal-config/index.ts'
import type { CSSProperties } from 'vue'

const { t } = useI18n()

const { config } = defineProps<{ config?: PortalConfig['linksConfig'] }>()

const reducedMotion = usePrefersReducedMotion()

const underlineColor = computed(() => config?.underlineColor ? `rgb(var(--v-theme-${config.underlineColor}))` : 'currentColor')

const linkStyle = (isHovering: boolean | null) => {
  const underline = config?.underline ?? 'always'
  const color = config?.color ?? 'primary'
  const themeColor = ['primary', 'secondary'].includes(color) ? `text-${color}` : color
  const underlined = underline === 'always' || underline === 'always-grow' || (underline === 'hover' && !!isHovering)
  return {
    position: underline === 'hover-grow' ? 'relative' : undefined,
    color: `rgb(var(--v-theme-${themeColor}))`,
    textDecoration: underlined ? 'underline' : 'none',
    textUnderlineOffset: '2px',
    textDecorationThickness: underline === 'always-grow' && isHovering ? '2px' : undefined,
    textDecorationColor: config?.underlineColor ? `rgb(var(--v-theme-${config.underlineColor}))` : undefined
  } satisfies CSSProperties
}

const barStyle = (isHovering: boolean | null) => {
  const style = {
    position: 'absolute',
    left: '0',
    bottom: '-3px',
    width: '45px',
    height: '3px',
    backgroundColor: underlineColor.value,
    transform: isHovering ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform .25s ease-out'
  } satisfies CSSProperties
  return stripMotion(style, reducedMotion.value)
}
</script>

<i18n lang="yaml">
  en:
    sampleText: 'A text containing'
    sampleLink: 'a link'
    sampleTextEnd: 'to another page.'
  fr:
    sampleText: 'Un texte contenant'
    sampleLink: 'un lien'
    sampleTextEnd: 'vers une autre page.'
</i18n>
