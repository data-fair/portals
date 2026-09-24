<template>
  <div
    v-if="hasLinks"
    :class="[...footerElementClasses(element), 'text-body-small']"
  >
    <div v-if="title">
      {{ title }}
    </div>
    <social-links :links="portalConfig.socialLinks" />
  </div>
</template>

<script setup lang="ts">
import type { FooterSocialElement } from '#api/types/footer-elements/index.ts'

const { element } = defineProps<{ element: FooterSocialElement }>()

const { t } = useI18n()
const { portalConfig } = usePortalStore()

const hasLinks = computed(() => Object.keys(portalConfig.value.socialLinks ?? {}).length > 0)
const title = computed(() => element.title === undefined ? t('socialMedia') : element.title)
</script>

<i18n lang="yaml">
  en:
    socialMedia: 'Find us on social media'
  fr:
    socialMedia: 'Retrouvez-nous sur les réseaux sociaux'
</i18n>
