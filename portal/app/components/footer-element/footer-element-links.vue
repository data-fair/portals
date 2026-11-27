<template>
  <div :class="element.mb ? `mb-${element.mb}` : undefined">
    <!-- Links in single line: a list (RGAA 9.3), wrapped lines kept close to each other -->
    <ul
      v-if="element.display === 'inline'"
      :class="['footer-links footer-links-inline d-flex flex-wrap align-center my-2', footerJustifyClass(element.align)]"
    >
      <li
        v-for="(link, index) in element.items"
        :key="index"
        class="text-center"
      >
        <NuxtLink
          :to="resolveLink(link)"
          :target="link.type === 'external' && (link.target ?? true) ? '_blank' : undefined"
          :rel="linkRel(resolveLink(link), link.type === 'external' && (link.target ?? true))"
          :title="link.type === 'external' && (link.target ?? true) ? resolveLinkTitle(link, locale) + ' - ' + t('newWindow') : undefined"
          class="simple-link d-flex align-center"
        >
          <span class="d-flex align-center">
            <v-icon
              v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
              :icon="link.icon.mdi?.svgPath || link.icon.custom"
              :color="link.icon.color"
              size="small"
              class="mr-1"
            />
            {{ resolveLinkTitle(link, locale) }}
          </span>
        </NuxtLink>
      </li>
    </ul>

    <!-- Links in a vertical list -->
    <ul
      v-else-if="element.display === 'list'"
      :class="['footer-links d-flex flex-column', { 'align-center': element.align === 'center', 'align-end': element.align === 'right' }]"
    >
      <li
        v-for="(link, index) in element.items"
        :key="index"
        class="my-1"
      >
        <NuxtLink
          :to="resolveLink(link)"
          :target="link.type === 'external' && (link.target ?? true) ? '_blank' : undefined"
          :rel="linkRel(resolveLink(link), link.type === 'external' && (link.target ?? true))"
          :title="link.type === 'external' && (link.target ?? true) ? resolveLinkTitle(link, locale) + ' - ' + t('newWindow') : undefined"
          class="simple-link d-flex align-center"
        >
          <span class="d-flex align-center">
            <v-icon
              v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
              :icon="link.icon.mdi?.svgPath || link.icon.custom"
              :color="link.icon.color"
              size="small"
              class="mr-1"
            />
            {{ resolveLinkTitle(link, locale) }}
          </span>
        </NuxtLink>
      </li>
    </ul>

    <!-- Links in columns (legacy grid, kept for the migrated portals) -->
    <v-row
      v-else
      tag="ul"
      class="footer-links my-2"
      no-gutters
    >
      <v-col
        v-for="(link, index) in element.items"
        :key="index"
        tag="li"
        cols="10"
        sm="4"
        offset="2"
        offset-sm="2"
        class="pa-0"
      >
        <NuxtLink
          :to="resolveLink(link)"
          :target="link.type === 'external' && (link.target ?? true) ? '_blank' : undefined"
          :rel="linkRel(resolveLink(link), link.type === 'external' && (link.target ?? true))"
          :title="link.type === 'external' && (link.target ?? true) ? resolveLinkTitle(link, locale) + ' - ' + t('newWindow') : undefined"
          class="simple-link d-flex align-center"
        >
          <span class="d-flex align-center">
            <v-icon
              v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
              :icon="link.icon.mdi?.svgPath || link.icon.custom"
              :color="link.icon.color"
              size="small"
              class="mr-1"
            />
            {{ resolveLinkTitle(link, locale) }}
          </span>
        </NuxtLink>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { FooterLinksElement } from '#api/types/footer-elements/index.ts'

defineProps<{ element: FooterLinksElement }>()

const { locale, t } = useI18n()
const { resolveLink, resolveLinkTitle, linkRel } = useNavigationStore()
</script>

<style scoped>
.footer-links {
  list-style: none;
  padding: 0;
}
/* same 24px between the links as the former grid columns, but only 4px between wrapped lines */
.footer-links-inline {
  column-gap: 24px;
  row-gap: 4px;
}
</style>

<i18n lang="yaml">
  en:
    newWindow: New window
  fr:
    newWindow: Nouvelle fenêtre
</i18n>
