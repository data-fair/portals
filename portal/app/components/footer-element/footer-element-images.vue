<template>
  <div :class="footerElementClasses(element)">
    <v-row :class="footerJustifyClass(element.align)">
      <template
        v-for="(item, index) in items"
        :key="index"
      >
        <v-col
          v-if="item.src"
          cols="auto"
        >
          <NuxtLink
            v-if="item.link?.startsWith('/')"
            :to="item.link"
            :title="item.label"
            class="d-flex align-center"
          >
            <img
              :alt="item.label"
              :src="item.src"
              :height="element.height"
            >
          </NuxtLink>
          <a
            v-else-if="item.link"
            :href="item.link"
            :title="item.label + ' - ' + t('newWindow')"
            class="d-flex align-center"
            target="_blank"
            rel="noopener"
          >
            <img
              :alt="item.label + ' - ' + t('newWindow')"
              :src="item.src"
              :height="element.height"
            >
          </a>
          <img
            v-else
            :alt="item.label"
            :src="item.src"
            :height="element.height"
            class="d-block"
          >
        </v-col>
      </template>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { FooterImagesElement, FooterImagesItem } from '#api/types/footer-elements/index.ts'

const { element } = defineProps<{ element: FooterImagesElement }>()

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const getPortalImageSrc = usePortalImageSrc()
const themedLogo = useThemedLogo()

const headerLogo = () => {
  const { header, logo, logoDark } = portalConfig.value
  if (header.logoPrimaryType === 'local' && header.logoPrimary) return header.logoPrimary
  if (header.logoPrimaryType === 'default') return themedLogo(logo, logoDark)
  return undefined
}

const resolve = (item: FooterImagesItem) => {
  switch (item.source) {
    case 'global': {
      const image = themedLogo(portalConfig.value.logo, portalConfig.value.logoDark)
      return { src: image && getPortalImageSrc(image, false), label: item.label || t('mainLogo'), link: item.link }
    }
    case 'header': {
      const image = headerLogo()
      return { src: image && getPortalImageSrc(image, false), label: item.label || t('mainLogo'), link: item.link }
    }
    case 'upload': {
      const image = themedLogo(item.image, item.imageDark)
      return { src: image && getPortalImageSrc(image, false), label: item.label ?? '', link: item.link }
    }
    case 'koumoul':
      if (portal.value.whiteLabel) return { src: undefined, label: '', link: undefined }
      return { src: 'https://koumoul.com/static/logo-title-right.png', label: item.label || t('koumoulWebsite'), link: item.link || 'https://koumoul.com' }
  }
}

const items = computed(() => element.items.map(resolve))
</script>

<i18n lang="yaml">
  en:
    mainLogo: 'Main logo of the site'
    koumoulWebsite: 'Koumoul website'
    newWindow: 'New window'
  fr:
    mainLogo: 'Logo principal du site'
    koumoulWebsite: 'Site web Koumoul'
    newWindow: 'Nouvelle fenêtre'
</i18n>
