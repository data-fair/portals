<template>
  <template v-if="sections.length">
    <template v-if="lgAndUp && !isFluid">
      <!-- Empty left drawer to keep the content centered -->
      <v-navigation-drawer
        aria-hidden="true"
        color="transparent"
        location="left"
        tag="div"
        permanent
        floating
      />

      <v-navigation-drawer
        :aria-label="t('tableOfContents')"
        color="transparent"
        location="right"
        permanent
        floating
      >
        <v-sheet
          color="background"
          class="rounded-bs-md"
        >
          <toc-list
            :sections="sections"
            :active-id="activeId"
            @select="goToSection"
          />
        </v-sheet>
      </v-navigation-drawer>
    </template>

    <!-- Smaller screens / full-width pages: the table of contents collapses into a menu -->
    <v-fab
      v-else
      size="small"
      color="primary"
      location="top right"
      app
      icon
    >
      <v-icon :icon="mdiTableOfContents"/>
      <v-menu
        activator="parent"
        :close-on-content-click="false"
      >
        <v-card
          max-width="340"
          class="mt-2"
        >
          <toc-list
            :sections="sections"
            :active-id="activeId"
            @select="goToSection"
          />
        </v-card>
      </v-menu>
    </v-fab>
  </template>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { mdiTableOfContents } from '@mdi/js'
import type { PageConfig } from '#api/types/page'

const { isFluid } = defineProps<{ isFluid?: boolean }>()

const { t } = useI18n({ useScope: 'local' })
const { lgAndUp } = useDisplay()

const route = useRoute()

const pageConfig = inject<Ref<PageConfig | null>>('page-config')
const sections = computed(() => pageConfig?.value?._toc ?? [])

// Keep in sync with the scroll-margin-top applied to anchored titles in layout-title.vue
const scrollOffset = 96

const activeId = ref<string | null>(null)

// Highlight the last section whose title has scrolled past the offset line.
const findActiveId = () => {
  const list = sections.value
  const first = list[0]
  const last = list[list.length - 1]
  if (!first || !last) return
  let current = first.id
  let ready = false
  for (let i = list.length - 1; i >= 0; i--) {
    const section = list[i]!
    const el = document.getElementById(section.id)
    if (!el) continue
    ready = true
    if (el.getBoundingClientRect().top - scrollOffset - 4 <= 0) {
      current = section.id
      break
    }
  }
  // At the bottom of the page the last section may never cross the offset line, so force it active.
  const doc = document.documentElement
  if (ready && window.scrollY + window.innerHeight >= doc.scrollHeight - 1) {
    current = last.id
  }
  if (ready) activeId.value = current
}

let timeout: ReturnType<typeof setTimeout> | undefined
const onScroll = () => {
  clearTimeout(timeout)
  timeout = setTimeout(findActiveId, 17)
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  findActiveId()

  // Deep link: when arriving with an anchor in the URL, jump straight to that section.
  const hash = route.hash.slice(1)
  if (hash && sections.value.some(section => section.id === hash)) {
    await nextTick()
    document.getElementById(hash)?.scrollIntoView()
    activeId.value = hash
  }
})

onUnmounted(() => {
  clearTimeout(timeout)
  window.removeEventListener('scroll', onScroll)
})

const goToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth' })
  history.replaceState(history.state, '', '#' + id)
  activeId.value = id
}

</script>

<i18n lang="yaml">
fr:
  tableOfContents: Sommaire
en:
  tableOfContents: Table of contents
</i18n>
