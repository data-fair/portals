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
    <div class="w-100 py-4">
      <div
        v-for="(row, rowIndex) in footer.rows"
        :key="rowIndex"
        :class="['w-100', row.background?.color && `bg-${row.background.color}`]"
        :style="row.background?.color ? backgroundStyle(row.background) : undefined"
      >
        <v-container :class="row.background?.color ? 'py-3' : 'py-0'">
          <v-row>
            <v-col
              v-for="(column, columnIndex) in row.columns"
              :key="columnIndex"
              :md="columnMd(column.width)"
              cols="12"
            >
              <footer-element
                v-for="(element, elementIndex) in column.blocks"
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
import type { Footer, FooterColumn } from '#api/types/portal-config-footer/index.ts'

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const getPortalImageSrc = usePortalImageSrc()

const footer = computed(() => portalConfig.value.footer)

const widths: Record<FooterColumn['width'], number | undefined> = { auto: undefined, '1/4': 3, '1/3': 4, '1/2': 6, '2/3': 8, '3/4': 9 }
const columnMd = (width: FooterColumn['width']) => widths[width]

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
