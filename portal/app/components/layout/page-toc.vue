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

const pageConfig = inject<Ref<PageConfig | null>>('page-config')
const sections = computed(() => pageConfig?.value?._toc ?? [])

const activeId = ref<string | null>(null)

const goToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth' })
  history.replaceState(history.state, '', '#' + id)
}

</script>

<i18n lang="yaml">
fr:
  tableOfContents: Sommaire
en:
  tableOfContents: Table of contents
</i18n>
