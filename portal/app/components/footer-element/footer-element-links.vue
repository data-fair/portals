<template>
  <div :class="element.mb ? `mb-${element.mb}` : undefined">
    <!-- Links in single line -->
    <v-row
      v-if="element.display === 'inline'"
      :class="['my-2', footerJustifyClass(element.align)]"
    >
      <v-col
        v-for="(link, index) in element.items"
        :key="index"
        cols="auto"
        class="text-center"
      >
        <NuxtLink
          :to="resolveLink(link)"
          :target="link.type === 'external' && link.target ? '_blank' : undefined"
          :rel="linkRel(resolveLink(link), link.type === 'external' && link.target)"
          :title="link.type === 'external' && link.target ? resolveLinkTitle(link, locale) + ' - ' + t('newWindow') : undefined"
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

    <!-- Links in a vertical list -->
    <div
      v-else-if="element.display === 'list'"
      :class="['d-flex flex-column', { 'align-center': element.align === 'center', 'align-end': element.align === 'right' }]"
    >
      <NuxtLink
        v-for="(link, index) in element.items"
        :key="index"
        :to="resolveLink(link)"
        :target="link.type === 'external' && link.target ? '_blank' : undefined"
        :rel="linkRel(resolveLink(link), link.type === 'external' && link.target)"
        :title="link.type === 'external' && link.target ? resolveLinkTitle(link, locale) + ' - ' + t('newWindow') : undefined"
        class="simple-link d-flex align-center my-1"
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
    </div>

    <!-- Links in columns (legacy grid, kept for the migrated portals) -->
    <v-row
      v-else
      class="my-2"
      no-gutters
    >
      <v-col
        v-for="(link, index) in element.items"
        :key="index"
        cols="10"
        sm="4"
        offset="2"
        offset-sm="2"
        class="pa-0"
      >
        <NuxtLink
          :to="resolveLink(link)"
          :target="link.type === 'external' && link.target ? '_blank' : undefined"
          :rel="linkRel(resolveLink(link), link.type === 'external' && link.target)"
          :title="link.type === 'external' && link.target ? resolveLinkTitle(link, locale) + ' - ' + t('newWindow') : undefined"
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
const { resolveLink, resolveLinkTitle } = useNavigationStore()
</script>

<i18n lang="yaml">
  en:
    newWindow: New window
  fr:
    newWindow: Nouvelle fenêtre
</i18n>
