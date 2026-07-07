<template>
  <preview>
    <p class="mb-0">
      {{ t('sampleText') }}
      <a
        href="#"
        class="simple-link"
        :style="linkStyle"
        @click.prevent
      >{{ t('sampleLink') }}</a>
      {{ t('sampleTextEnd') }}
    </p>
  </preview>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal-config/index.ts'

const { t } = useI18n()

const { config } = defineProps<{ config?: PortalConfig['linksConfig'] }>()

const linkStyle = computed(() => {
  const underline = config?.underline ?? 'always'
  const color = config?.color ?? 'primary'
  const themeColor = ['primary', 'secondary'].includes(color) ? `text-${color}` : color
  return {
    color: `rgb(var(--v-theme-${themeColor}))`,
    textDecoration: underline === 'always' ? 'underline' : 'none',
    textUnderlineOffset: '2px'
  }
})
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
