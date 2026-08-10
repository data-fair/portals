<template>
  <!--
    IMPORTANT: Manual v-for with <v-breadcrumbs-item> is used instead of the ":items" prop because:
      1. Bug Fix: Combining ":items" with the "#divider" slot in Nuxt 3 triggers a Vue "Slot invoked
        outside of render function" warning during hydration due to Vuetify's internal slot management.
      2. Stability: Manual rendering bypasses complex internal logic, ensuring a stable render cycle
        and better performance when breadcrumbs are updated reactively from a store.
  -->
  <component
    :is="isLayoutFull ? 'div' : VContainer"
    :class="isLayoutFull ? 'd-none d-sm-block' : undefined"
    v-bind="isLayoutFull ? undefined : {
      class: 'pa-0',
      fluid: breadcrumbConfig.fluid,
    }"
  >
    <nav :aria-label="t('breadcrumb')">
      <v-breadcrumbs
        tag="ol"
        density="compact"
        :class="{ 'px-0 ml-n1': isElement, 'layout-full-breadcrumbs': isLayoutFull }"
      >
        <template
          v-for="(item, index) in breadcrumbItems"
          :key="index"
        >
          <v-breadcrumbs-item
            v-bind="typeof item === 'object' ? item : { title: item }"
            :class="{ 'text-body-medium': breadcrumbConfig.compact && !isLayoutFull, 'text-medium-emphasis': !isLayoutFull }"
            :aria-current="index === breadcrumbItems.length - 1 ? 'page' : undefined"
          />

          <v-breadcrumbs-divider
            v-if="index < breadcrumbItems.length - 1"
            :class="{ 'px-1': breadcrumbConfig.compact && !isLayoutFull }"
          >
            <v-icon
              v-if="breadcrumbConfig.separator?.type === 'icon' && breadcrumbConfig.separator.icon?.svgPath"
              :icon="breadcrumbConfig.separator.icon.svgPath"
              :color="breadcrumbConfig.separator.color"
              size="small"
            />
            <span
              v-else
              :class="[
                breadcrumbConfig.separator?.color ? `text-${breadcrumbConfig.separator.color}` : undefined,
                { 'text-body-medium': breadcrumbConfig.compact && !isLayoutFull, 'text-medium-emphasis': !isLayoutFull },
              ]"
            >
              {{ breadcrumbConfig.separator?.text || '/' }}
            </span>
          </v-breadcrumbs-divider>
        </template>
      </v-breadcrumbs>
    </nav>
  </component>
</template>

<script setup lang="ts">
import type { VBreadcrumbs } from 'vuetify/components'
import { VContainer } from 'vuetify/components'

type BreadcrumbItems = NonNullable<VBreadcrumbs['$props']['items']>

defineProps<{ isLayoutFull?: boolean, isElement?: boolean }>()

const { portalConfig } = usePortalStore()
const { breadcrumbs } = useNavigationStore()

const { t } = useI18n()

const breadcrumbConfig = computed(() => portalConfig.value.breadcrumb)

const breadcrumbItems = computed(() => {
  const items: BreadcrumbItems = [...breadcrumbs.value]

  // Add home link if configured
  if (breadcrumbConfig.value.showHome) {
    items.unshift({
      title: breadcrumbConfig.value.homeLabel || t('home'),
      to: '/',
      disabled: items.length === 0,
    })
  }

  // The current page (last item) must not be a link: an <a href> with aria-disabled is
  // invalid HTML (W3C) and the v-breadcrumbs-item--disabled class already conveys the visual state.
  // Stripping `to`/`href` makes Vuetify render it as plain text inside the <li> while keeping the
  // disabled class and aria-current="page".
  const last = items[items.length - 1]
  if (last && typeof last === 'object') {
    const { to: _to, href: _href, ...rest } = last
    items[items.length - 1] = rest
  }

  return items
})
</script>

<i18n lang="yaml">
  en:
    home: Home
    breadcrumb: 'You are here:'
  fr:
    home: 'Accueil'
    breadcrumb: 'Vous êtes ici :'
</i18n>

<style scoped>

:deep(.v-breadcrumbs-item--link:not([aria-current="page"])) {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

:deep(.v-breadcrumbs-item--link:not([aria-current="page"]):hover),
:deep(.v-breadcrumbs-item--link:not([aria-current="page"]):active) {
  text-decoration-thickness: 2px;
}

:deep(.v-breadcrumbs-divider) {
  pointer-events: none;
  user-select: none;
}

/*
  In the full layout the breadcrumbs live inside a fixed-height (64px) app bar whose content
  is clipped (overflow: hidden). Without constraints a long title wraps to many lines and gets
  cut off vertically. We cap each item to 2 lines with an ellipsis. `min-width: min-content`
  keeps single-word items (e.g. "Datasets", "Table") at their natural width so only the long
  items shrink and wrap — no hard-coded width, fully responsive.
*/
.layout-full-breadcrumbs :deep(.v-breadcrumbs-item),
.layout-full-breadcrumbs :deep(.v-breadcrumbs-item--link) {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-width: min-content;
}
</style>
