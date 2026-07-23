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
      <!-- Action announcements for screen readers (sort, pagination) -->
      <div
        class="d-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ actionAnnouncement }}
      </div>

      <!-- Count (top) -->
      <!-- role/aria-live live on the wrapper because role="status" is invalid on heading elements (W3C) -->
      <div
        v-if="countPosition === 'top'"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <component
          :is="headingTag"
          class="text-headline-medium mb-4"
        >
          {{ countLabel }}
          <slot name="count-extra" />
        </component>
      </div>

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
      <div
        v-if="element.showAdvancedFilters"
        class="mb-4"
      >
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
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {{ t('resultsCount', { count: itemsCount }) }}
            <slot name="count-extra" />
          </div>
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
            :disabled="!!search"
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
          <slot
            name="item-card"
            :item="item"
          />
        </v-col>
      </v-row>

      <!-- Loading spinner -->
      <div
        v-if="loading"
        class="d-flex justify-center"
        role="status"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :aria-label="t('loading')"
        />
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
  'update:sort': [value: string | undefined]
  'update:order': [value: '-1' | '1' | undefined]
}>()

defineSlots<{
  'item-card': (props: { item: T }) => void
  'count-extra': () => void
  'page-elements': (props: { onUpdate: (newElements: PageElement[]) => void, elements: PageElement[] | undefined, addItemMessage: string }) => void
}>()

const { portalConfig, preview } = usePortalStore()
const { t } = useI18n()

// Active text search disables the sort control (results are ranked by relevance)
const search = useStringSearchParam('q')

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

// Live-region announcement for sort and pagination changes (RGAA 7.5).
// The result count is already announced via its own aria-live region; this
// covers actions that don't modify the count (sort, page navigation).
const actionAnnouncement = ref('')

const currentSortTitle = computed(() => {
  if (!props.sort) return undefined
  return props.sortItems.find(i => i.value === props.sort)?.title
})

watch(() => [props.sort, props.order], () => {
  if (!currentSortTitle.value) return
  const orderLabel = props.order === '1' ? t('sortAscending') : t('sortDescending')
  actionAnnouncement.value = t('sortAnnouncement', { sort: currentSortTitle.value, order: orderLabel })
})

// Announce only user-initiated page navigation in paginated mode. Skip infinite
// scroll (paginationPosition === 'none'), where the page counter is an
// implementation detail invisible to the user. Skip newPage === 1 too, which
// occurs on filter reset (handled by the count announcement).
watch(() => props.currentPage, (newPage) => {
  if (paginationPosition.value === 'none' || newPage <= 1) return
  actionAnnouncement.value = t('pageAnnouncement', { current: newPage, total: props.totalPages })
})
</script>

<i18n lang="yaml">
  en:
    resultsCount: 'No result | {count} result | {count} results'
    loading: Loading results
    sortAscending: ascending order
    sortDescending: descending order
    sortAnnouncement: 'Sorted by {sort}, {order}'
    pageAnnouncement: 'Page {current} of {total}'
  fr:
    resultsCount: 'Aucun résultat | {count} résultat | {count} résultats'
    loading: Chargement des résultats
    sortAscending: ordre croissant
    sortDescending: ordre décroissant
    sortAnnouncement: 'Tri par {sort}, {order}'
    pageAnnouncement: 'Page {current} sur {total}'
</i18n>
