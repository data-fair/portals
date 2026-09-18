<template>
  <div :class="footerElementClasses(element)">
    <template
      v-for="(link, index) in element.items"
      :key="index"
    >
      <v-btn
        v-if="link.type === 'external'"
        :href="link.href"
        :title="link.title + ' - ' + t('newWindow')"
        :variant="element.variant"
        target="_blank"
        rel="noopener"
        class="text-uppercase"
      >
        <template #prepend>
          <v-icon
            v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
            :icon="link.icon.mdi?.svgPath || link.icon.custom"
            :color="link.icon.color"
          />
        </template>
        {{ link.title }}
      </v-btn>
      <v-btn
        v-else
        :to="resolveLink(link)"
        :variant="element.variant"
      >
        <template #prepend>
          <v-icon
            v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
            :icon="link.icon.mdi?.svgPath || link.icon.custom"
            :color="link.icon.color"
          />
        </template>
        {{ resolveLinkTitle(link, locale) }}
      </v-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { FooterButtonsElement } from '#api/types/footer-elements/index.ts'

defineProps<{ element: FooterButtonsElement }>()

const { t, locale } = useI18n()
const { resolveLink, resolveLinkTitle } = useNavigationStore()
</script>

<i18n lang="yaml">
  en:
    newWindow: 'New window'
  fr:
    newWindow: 'Nouvelle fenêtre'
</i18n>
