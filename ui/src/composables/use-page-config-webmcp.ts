import { computed, shallowRef, watch, toRaw, type Ref } from 'vue'
import { compile } from '@json-layout/core/compile'
import { StatefulLayout } from '@json-layout/core/state'
import { WebMCP } from '@json-layout/core/webmcp'
import equal from 'fast-deep-equal'
import type { PageConfig } from '#api/types/page/index.ts'
// @ts-ignore — schema is a plain JS module, no type declarations
import pageConfigSchema from '#api/types/page-config/schema.js'

// Minimal schema for WebMCP: only metadata fields, no elements
// (elements use external $ref schemas that compile() cannot resolve at runtime)
const metadataLayout = pageConfigSchema.layout.children[0] // "Metadata" section only
const pageConfigMetaSchema = {
  $id: 'https://github.com/data-fair/portals/page-config-meta',
  'x-vjsf': { xI18n: true },
  title: pageConfigSchema.title,
  type: 'object',
  layout: { title: null, children: [metadataLayout] },
  required: (pageConfigSchema.required as string[]).filter(k => k !== 'elements'),
  properties: Object.fromEntries(
    Object.entries(pageConfigSchema.properties as Record<string, unknown>)
      .filter(([key]) => key !== 'elements')
  ),
  $defs: pageConfigSchema.$defs
}

export function usePageConfigWebMCP (
  editConfig: Ref<PageConfig | undefined>,
  locale: Ref<string>,
  onData: (data: any) => void
) {
  const compiledLayout = computed(() => {
    return compile(pageConfigMetaSchema, { locale: locale.value, xI18n: true })
  })

  const statefulLayout = shallowRef<StatefulLayout | null>(null)
  const webMCP = shallowRef<WebMCP | null>(null)
  let setupInProgress = false

  async function setup (cl: ReturnType<typeof compile>, config: PageConfig) {
    if (setupInProgress) return
    setupInProgress = true
    try {
      if (webMCP.value) {
        await webMCP.value.unregisterTools()
        webMCP.value = null
      }

      const sl = new StatefulLayout(
        toRaw(cl),
        toRaw(cl.skeletonTrees[cl.mainTree]),
        {
          width: 600,
          updateOn: 'input',
          onData
        },
        toRaw(config)
      )
      statefulLayout.value = sl

      const wm = new WebMCP(
        sl as any,
        { prefixName: 'pageConfig_', dataTitle: 'Page configuration', includeSubAgent: true }
      )
      await wm.registerTools()
      webMCP.value = wm
    } catch (e) {
      console.error('[usePageConfigWebMCP] setup error', e)
    } finally {
      setupInProgress = false
    }
  }

  // Re-create StatefulLayout + WebMCP only when compiled layout (locale) changes
  watch(compiledLayout, async (cl) => {
    const config = editConfig.value
    if (!cl || !config) {
      if (webMCP.value) {
        await webMCP.value.unregisterTools()
        webMCP.value = null
      }
      statefulLayout.value = null
      return
    }
    await setup(cl, config)
  }, { immediate: true })

  // Initialize when editConfig first becomes available, and sync external changes
  watch(editConfig, async (config) => {
    if (config && compiledLayout.value && !webMCP.value) {
      await setup(compiledLayout.value, config)
    }
    // Sync external changes (user edits via main form) → agent StatefulLayout
    // Use deep-equal to prevent feedback loops when onData triggers editConfig updates
    if (statefulLayout.value && config && !equal(statefulLayout.value.data, toRaw(config))) {
      statefulLayout.value.data = toRaw(config)
    }
  })

  const configureContext = computed(() => {
    const lines = [
      'Use the subagent tool pageConfig_form to help the user configure this page.',
      'Start by asking the user what they want to achieve.',
    ]
    if (editConfig.value?.title) lines.push(`The page title is "${editConfig.value.title}".`)
    if (editConfig.value?.description) lines.push(`Description: ${editConfig.value.description}`)
    return lines.join(' ')
  })

  return { statefulLayout, webMCP, configureContext }
}
