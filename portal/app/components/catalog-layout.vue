<template>
  <v-row>
    <!-- Left Column: Filters (256px) -->
    <v-col
      v-if="element.filters?.items?.length && element.filters.position === 'left' && !$vuetify.display.smAndDown"
      style="max-width: 256px;"
    >
      <v-row>
        <catalog-filters
          :config="element"
          :catalog-type="catalogType"
          drawer
        />
      </v-row>
    </v-col>

    <!-- Main Column -->
    <v-col>
      <!-- Count (top) -->
      <component
        :is="headingTag"
        v-if="countPosition === 'top'"
        class="text-headline-medium mb-4"
      >
        {{ countLabel }}
        <slot name="count-extra" />
      </component>

      <!-- Standard Filters -->
      <v-row
        v-if="element.filters?.items?.length && (element.filters.position !== 'left' || $vuetify.display.smAndDown)"
        class="mb-4"
      >
        <catalog-filters
          :config="element"
          :catalog-type="catalogType"
        />
      </v-row>

      <!-- Advanced Filters slot -->
      <div v-if="element.showAdvancedFilters" class="mb-4">
        <slot
          name="page-elements"
          :on-update="(newElements: PageElement[]) => ({ ...element, advancedFilters: newElements})"
          :elements="element.advancedFilters"
          add-item-message="Ajouter un filtre (Mode avancé)"
        />
      </div>

      <!-- Count + Sort row -->
      <v-row
        v-if="countPosition === 'bottom' && element.showSortBesideCount"
        class="align-end mb-4"
      >
        <v-col>
          {{ t('resultsCount', { count: itemsCount }) }}
          <slot name="count-extra" />
        </v-col>
        <v-col
          cols="12"
          md="6"
          lg="4"
        >
          <catalog-sort
            :sort="sort"
            :order="order"
            :items="sortItems"
            :density="element.filters?.density || 'comfortable'"
            :rounded="element.filters?.rounded"
            @update:sort="$emit('update:sort', $event)"
            @update:order="$emit('update:order', $event)"
          />
        </v-col>
      </v-row>

      <!-- Pagination above results -->
      <catalog-pagination
        v-if="paginationPosition === 'before' || paginationPosition === 'both'"
        :current-page="currentPage"
        :total-pages="totalPages"
        :alignment="element.pagination?.alignment"
        class="mb-4"
        @update:page="$emit('go-to-page', $event)"
      />

      <!-- Items grid -->
      <v-row
        v-if="countPosition !== 'bottom' || element.showSortBesideCount"
        class="d-flex align-stretch"
      >
        <v-col
          v-for="(item, index) in displayedItems"
          :key="index"
          :md="12 / (element.columns || 2)"
          cols="12"
        >
          <slot name="item-card" :item="item" />
        </v-col>
      </v-row>

      <!-- Loading spinner -->
      <div v-if="loading" class="d-flex justify-center">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- Pagination below results -->
      <catalog-pagination
        v-if="paginationPosition === 'after' || paginationPosition === 'both'"
        :current-page="currentPage"
        :total-pages="totalPages"
        :alignment="element.pagination?.alignment"
        @update:page="$emit('go-to-page', $event)"
      />

      <!-- Intersection observer trigger for infinite scroll -->
      <div
        v-if="hasMore && paginationPosition === 'none'"
        v-intersect="(isIntersecting: boolean) => isIntersecting && $emit('load-more')"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts" generic="T">
import type { DatasetsCatalogElement, ApplicationsCatalogElement, ReusesCatalogElement, EventCatalogElement, NewsCatalogElement, PageElement } from '#api/types/page'

export type CatalogElement = DatasetsCatalogElement | ApplicationsCatalogElement | ReusesCatalogElement | EventCatalogElement | NewsCatalogElement

const props = defineProps<{
  element: CatalogElement
  catalogType: 'applications' | 'datasets' | 'reuses' | 'events' | 'news'
  countLabel: string
  displayedItems: T[]
  loading: boolean
  currentPage: number
  totalPages: number
  itemsCount: number
  sort?: string
  order?: string
  sortItems: { title: string, value: string }[]
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()

defineEmits<{
  'go-to-page': [page: number]
  'load-more': []
  'update:sort': [value: string]
  'update:order': [value: '-1' | '1']
}>()

defineSlots<{
  'item-card': (props: { item: T }) => void
  'count-extra': () => void
  'page-elements': (props: { onUpdate: (newElements: PageElement[]) => void, elements: PageElement[] | undefined, addItemMessage: string }) => void
}>()

const { portalConfig, preview } = usePortalStore()
const { t } = useI18n()

const headingTag = computed(() => {
  let level = 1
  if (portalConfig.value.header?.show && portalConfig.value.header?.showTitle) level++
  if (props.context?.isRoot && props.context.index > 0) level++
  return `h${level}`
})

const countPosition = computed(() => props.element.countPosition || 'top')

const paginationPosition = computed(() => props.element.pagination?.position || 'none')

const hasMore = computed(() => {
  if (preview || paginationPosition.value !== 'none') return false
  return props.displayedItems.length < props.itemsCount
})
</script>

<i18n lang="yaml">
  en:
    resultsCount: 'No result | {count} result | {count} results'
  fr:
    resultsCount: 'Aucun résultat | {count} résultat | {count} résultats'
</i18n>
