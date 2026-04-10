import { computed, shallowRef, watch, toRaw, type Ref } from 'vue'
import { StatefulLayout } from '@json-layout/core/state'
import { WebMCP } from '@json-layout/core/webmcp'
import equal from 'fast-deep-equal'
import type { PageConfig } from '#api/types/page/index.ts'

const compiledLayoutImports: Record<string, () => Promise<any>> = {
  fr: () => import('#api/types/page-config-simple/.type/compiled-layout-fr.js'),
  en: () => import('#api/types/page-config-simple/.type/compiled-layout-en.js')
}

export function usePageConfigWebMCP (
  editConfig: Ref<PageConfig | undefined>,
  locale: Ref<string>,
  onData: (data: any) => void
) {
  const compiledLayout = shallowRef<any>(null)
  const statefulLayout = shallowRef<StatefulLayout | null>(null)
  const webMCP = shallowRef<WebMCP | null>(null)
  let setupInProgress = false

  async function setup (cl: any, config: PageConfig) {
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

  // Load compiled layout when locale changes
  watch(locale, async (loc) => {
    const importFn = compiledLayoutImports[loc] ?? compiledLayoutImports.fr
    const mod = await importFn()
    compiledLayout.value = mod.compiledLayout
  }, { immediate: true })

  // Re-create StatefulLayout + WebMCP when compiled layout changes
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
  })

  // Initialize when editConfig first becomes available, and sync external changes
  watch(editConfig, async (config) => {
    if (config && compiledLayout.value && !webMCP.value) {
      await setup(compiledLayout.value, config)
    }
    // Sync external changes (user edits via main form) -> agent StatefulLayout
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
