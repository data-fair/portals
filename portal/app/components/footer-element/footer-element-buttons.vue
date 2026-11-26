<template>
  <!-- the template drops the whitespace between the buttons: the gap keeps them apart, also between wrapped lines -->
  <div :class="[...footerElementClasses(element), 'd-flex flex-wrap align-center ga-2', footerJustifyClass(element.align)]">
    <template
      v-for="(link, index) in element.items"
      :key="index"
    >
      <v-btn
        v-if="link.type === 'external'"
        :href="link.href"
        :title="link.title + ' - ' + t('newWindow')"
        :variant="variantOf(index)"
        :rel="linkRel(link.href, true)"
        target="_blank"
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
        :rel="linkRel(resolveLink(link))"
        :variant="variantOf(index)"
        class="text-uppercase"
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

const props = defineProps<{ element: FooterButtonsElement }>()

// the first button can stand apart (main call to action) while staying on the same line as the others
const variantOf = (index: number) => (index === 0 && props.element.firstVariant) || props.element.variant

const { t, locale } = useI18n()
const { resolveLink, resolveLinkTitle, linkRel } = useNavigationStore()
</script>

<i18n lang="yaml">
  en:
    newWindow: 'New window'
  fr:
    newWindow: 'Nouvelle fenêtre'
</i18n>
