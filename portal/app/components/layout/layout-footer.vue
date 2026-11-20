<template>
  <v-footer
    id="footer"
    :color="footer.background.color"
    :style="backgroundStyle(footer.background)"
    :class="[
      'pa-0 d-flex justify-center flex-wrap flex-grow-0 footer-fab-clearance',
      footer.background.color === 'background' ? 'border-t' : undefined,
      belowAgentChatFab && 'footer-fab-clearance-double'
    ]"
    tabindex="-1"
  >
    <!-- py-3 here plus py-1 on a plain row keeps 16px above and below the footer content,
         and separates two consecutive rows by 8px; skipped next to a row background, it would show a band of the footer color -->
    <div :class="['w-100', !hasBackground(footer.rows[0]) && 'pt-3', !hasBackground(footer.rows.at(-1)) && 'pb-3']">
      <div
        v-for="(row, rowIndex) in footer.rows"
        :key="rowIndex"
        :class="['w-100', row.background?.color && `bg-${row.background.color}`]"
        :style="row.background ? backgroundStyle(row.background) : undefined"
      >
        <v-container :class="hasBackground(row) ? 'py-3' : 'py-1'">
          <v-row
            :density="row.gutter === 'dense' ? 'comfortable' : undefined"
            :no-gutters="row.gutter === 'none'"
            :class="row.align && `align-${row.align}`"
          >
            <v-col
              v-for="(blocks, columnIndex) in footerRowColumns(row)"
              :key="columnIndex"
              :md="columnMd(row, columnIndex)"
              cols="12"
            >
              <footer-element
                v-for="(element, elementIndex) in blocks"
                :key="elementIndex"
                :element="element"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>

    <!-- Copyright -->
    <template v-if="footer.copyright && !portal.whiteLabel">
      <v-divider />
      <div class="text-center my-2">
        <span>&copy;{{ new Date().getFullYear() }} — </span><strong><a
          href="https://koumoul.com"
          :title="t('koumoulWebsite') + ' - ' + t('newWindow')"
          target="_blank"
          rel="noopener external"
          class="text-decoration-underline"
          style="color: inherit"
        >Koumoul</a></strong>
      </div>
    </template>
  </v-footer>
</template>

<script setup lang="ts">
import type { Footer, FooterRow } from '#api/types/portal-config-footer/index.ts'
import { footerRowColumns } from '#api/types/portal-config-footer/walk.ts'

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const getPortalImageSrc = usePortalImageSrc()

const footer = computed(() => portalConfig.value.footer)

// same rule as layout-scroll-to-top: the scroll-to-top button sits above the agent chat button
const route = useRoute()
const belowAgentChatFab = computed(() => {
  const agentChat = portalConfig.value.agentChat
  return agentChat?.active && agentChat.togglePosition !== 'appBar' && route.meta.layout !== 'full'
})

const hasBackground = (row?: FooterRow) => !!(row?.background?.color || row?.background?.image)

const columnMd = (row: FooterRow, index: number) => {
  if (row.columns === 3) return 4
  if (row.columns === 2) {
    if (row.disposition === 'left') return index === 0 ? 8 : 4
    if (row.disposition === 'right') return index === 0 ? 4 : 8
    return 6
  }
  return 12
}

const backgroundStyle = (background: Footer['background'] | NonNullable<Footer['rows'][number]['background']>) => {
  if (!background.image) return undefined
  const location = background.imageLocation ?? 'right'
  return {
    backgroundImage: `url(${getPortalImageSrc(background.image, false)})`,
    backgroundPosition: `bottom ${location}`,
    backgroundRepeat: location === 'repeat' ? 'repeat' : 'no-repeat'
  }
}
</script>

<style scoped>
/* below lg, the content reaches the right edge, where the fixed scroll-to-top button (48px + 16px margin) stays
   at the end of the page: leave room for it so that it does not cover the last footer links (WCAG 2.4.11) */
@media (max-width: 1279.98px) {
  .footer-fab-clearance {
    padding-bottom: 64px !important;
  }
  .footer-fab-clearance-double {
    padding-bottom: 144px !important;
  }
}
</style>

<i18n lang="yaml">
  en:
    koumoulWebsite: 'Koumoul website'
    newWindow: 'New window'
  fr:
    koumoulWebsite: 'Site web Koumoul'
    newWindow: 'Nouvelle fenêtre'
</i18n>
