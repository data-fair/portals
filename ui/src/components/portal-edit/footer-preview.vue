<template>
  <preview
    :append-title="t('footer')"
    no-padding
  >
    <template #prepend>
      <v-checkbox
        v-model="grid"
        :label="t('showGrid')"
        color="success"
        density="compact"
        hide-details
        class="flex-grow-0"
      />
    </template>
    <div
      :class="{ 'footer-grid': grid }"
      :style="grid ? labels : undefined"
    >
      <slot />
    </div>
  </preview>
</template>

<script setup lang="ts">
const { t } = useI18n()

const grid = ref(false)

// the labels are read back by the css of the badges, hence the quoted strings
const labels = computed(() => Object.fromEntries(
  ['row', 'columnSingle', 'columnLeft', 'columnCenter', 'columnRight', 'wide', 'narrow']
    .map(key => [`--fgd-${key}`, JSON.stringify(t(key))])
))
</script>

<style scoped>
/* the grid is read from the footer markup: a row is the div wrapping a container
   and its columns are the direct cols of that container */
.footer-grid {
  counter-reset: fgd-row;
}
/* the row and the column each reserve a strip at their top so their badges never overlap */
.footer-grid :deep(div:has(> .v-container)) {
  position: relative;
  padding-top: 1rem;
  outline: 1px solid rgb(var(--v-theme-error));
  counter-increment: fgd-row;
}
.footer-grid :deep(.v-container > .v-row > .v-col) {
  position: relative;
  padding-top: 1rem;
  outline: 1px dashed rgb(var(--v-theme-warning));
}

.footer-grid :deep(div:has(> .v-container))::before,
.footer-grid :deep(.v-container > .v-row > .v-col)::before {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  padding: 0 2px;
  font-size: 0.625rem;
  line-height: 1.4;
  white-space: nowrap;
}
.footer-grid :deep(div:has(> .v-container))::before {
  content: var(--fgd-row) ' ' counter(fgd-row);
  color: rgb(var(--v-theme-on-error));
  background-color: rgb(var(--v-theme-error));
}
.footer-grid :deep(.v-container > .v-row > .v-col)::before {
  color: rgb(var(--v-theme-on-warning));
  background-color: rgb(var(--v-theme-warning));
}
/* the md width of a column tells its place: 12 is alone, 6 and 6 are halves,
   8 and 4 are the wide and narrow ones, and three cols of 4 are a triptych */
.footer-grid :deep(.v-col--cols-md-12)::before {
  content: var(--fgd-columnSingle);
}
.footer-grid :deep(.v-col--cols-md-6:first-child)::before {
  content: var(--fgd-columnLeft);
}
.footer-grid :deep(.v-col--cols-md-6:last-child)::before {
  content: var(--fgd-columnRight);
}
.footer-grid :deep(.v-col--cols-md-8:first-child)::before {
  content: var(--fgd-columnLeft) ' ' var(--fgd-wide);
}
.footer-grid :deep(.v-col--cols-md-8:last-child)::before {
  content: var(--fgd-columnRight) ' ' var(--fgd-wide);
}
.footer-grid :deep(.v-row:not(:has(> :nth-child(3))) > .v-col--cols-md-4:first-child)::before {
  content: var(--fgd-columnLeft) ' ' var(--fgd-narrow);
}
.footer-grid :deep(.v-row:not(:has(> :nth-child(3))) > .v-col--cols-md-4:last-child)::before {
  content: var(--fgd-columnRight) ' ' var(--fgd-narrow);
}
.footer-grid :deep(.v-row:has(> :nth-child(3)) > .v-col:nth-child(1))::before {
  content: var(--fgd-columnLeft);
}
.footer-grid :deep(.v-row:has(> :nth-child(3)) > .v-col:nth-child(2))::before {
  content: var(--fgd-columnCenter);
}
.footer-grid :deep(.v-row:has(> :nth-child(3)) > .v-col:nth-child(3))::before {
  content: var(--fgd-columnRight);
}
</style>

<i18n lang="yaml">
  en:
    footer: Footer
    showGrid: Show the layout grid
    row: Row
    columnSingle: Single column
    columnLeft: Left column
    columnCenter: Center column
    columnRight: Right column
    wide: (wide)
    narrow: (narrow)
  fr:
    footer: Pied de page
    showGrid: Afficher la grille
    row: Ligne
    columnSingle: Colonne unique
    columnLeft: Colonne de gauche
    columnCenter: Colonne centrale
    columnRight: Colonne de droite
    wide: (large)
    narrow: (étroite)
</i18n>
