<template>
  <v-footer
    id="footer"
    :color="footer.background.color"
    :style="backgroundStyle(footer.background)"
    :class="[
      'pa-0 d-flex justify-center flex-wrap flex-grow-0',
      footer.background.color === 'background' ? 'border-t' : undefined
    ]"
    tabindex="-1"
  >
    <!-- py-3 here plus py-1 on a plain row keeps 16px above and below the footer content,
         and separates two consecutive rows by 8px -->
    <div class="w-100 py-3">
      <div
        v-for="(row, rowIndex) in footer.rows"
        :key="rowIndex"
        :class="['w-100', row.background?.color && `bg-${row.background.color}`]"
        :style="row.background ? backgroundStyle(row.background) : undefined"
      >
        <v-container :class="row.background?.color || row.background?.image ? 'py-3' : 'py-1'">
          <v-row
            :density="row.gutter === 'dense' ? 'comfortable' : undefined"
            :no-gutters="row.gutter === 'none'"
            :align="row.align"
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
          rel="noopener"
          class="simple-link"
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

<i18n lang="yaml">
  en:
    koumoulWebsite: 'Koumoul website'
    newWindow: 'New window'
  fr:
    koumoulWebsite: 'Site web Koumoul'
    newWindow: 'Nouvelle fenêtre'
</i18n>
