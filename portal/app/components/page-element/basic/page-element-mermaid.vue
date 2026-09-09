<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="element.code"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
  >
    <!--
      mermaid sizes its svg as width:100% capped by the diagram's natural max-width, so the
      svg has to be the flex item itself: wrapping it in a shrink-to-fit box instead collapses
      it to the 300px default intrinsic width of an svg with a percentage width.
    -->
    <div
      v-if="svg"
      :class="['d-flex', justify]"
      :role="element.description ? 'img' : undefined"
      :aria-label="element.description || undefined"
      v-html="svg"
    />
    <v-alert
      v-else-if="error && preview"
      type="warning"
      variant="tonal"
      :title="t('renderError')"
      :text="error"
    />
    <pre
      v-else-if="error"
      style="overflow-x: auto;"
    >{{ element.code }}</pre>
    <!-- mermaid only runs in the browser, so this is what the server renders and what stays
         on screen until the mermaid chunk is loaded and the diagram is drawn -->
    <div
      v-else
      :class="['d-flex', justify]"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MermaidElement } from '#api/types/page-elements/index.ts'
import { useTheme } from 'vuetify'
import { mermaidThemeVariables } from '../../../utils/mermaid'

const { element } = defineProps<{ element: MermaidElement }>()

const { t } = useI18n()
const { preview } = usePortalStore()
const theme = useTheme()

const svg = ref<string>()
const error = ref<string>()

const justify = computed(() => element.centered === false ? 'justify-start' : 'justify-center')

// mermaid keys its temporary rendering node on the id, so re-rendering the same
// block (theme change, live edit) needs a fresh one each time
let renderCount = 0

const render = async () => {
  if (!element.code) {
    svg.value = undefined
    error.value = undefined
    return
  }
  const id = `mermaid-${element.uuid ?? 'block'}-${renderCount++}`
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      // without it mermaid draws its own "syntax error" graphic into a temp node appended to
      // the body and throws before cleaning it up, leaving it on the page; we render our own
      suppressErrorRendering: true,
      theme: 'base',
      themeVariables: mermaidThemeVariables(theme.current.value.colors, theme.current.value.dark)
    })
    svg.value = (await mermaid.render(id, element.code)).svg
    error.value = undefined
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    svg.value = undefined
  }
}

onMounted(render)
watch(() => [element.code, theme.current.value.dark, theme.current.value.colors], render)
</script>

<i18n lang="yaml">
  en:
    renderError: This diagram could not be rendered
  fr:
    renderError: Ce diagramme n'a pas pu être affiché
</i18n>
