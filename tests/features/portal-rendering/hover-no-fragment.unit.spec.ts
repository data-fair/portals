import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const componentsDir = new URL('../../../portal/app/components/', import.meta.url)

const vueFiles = async (dir: URL): Promise<URL[]> => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: URL[] = []
  for (const entry of entries) {
    if (entry.isDirectory()) files.push(...await vueFiles(new URL(entry.name + '/', dir)))
    else if (entry.name.endsWith('.vue')) files.push(new URL(entry.name, dir))
  }
  return files
}

// Cards are links holding links (action buttons, topic chips): invalid HTML that the
// parser repairs by hoisting the card content out of the anchor and cloning it. Vue
// discards those leftovers in hydrateElement but not in hydrateFragment, so a fragment
// around a card — what VHover's slot return emits — makes the card render twice in SSR.
// useHoverState replaces it. Drop this guard once the nested links themselves are gone.
test.describe('hover state without fragment', () => {
  test('no portal component wraps its markup in VHover', async () => {
    const offenders: string[] = []
    for (const file of await vueFiles(componentsDir)) {
      if ((await readFile(file, 'utf8')).includes('<v-hover')) {
        offenders.push(file.pathname.split('/components/')[1]!)
      }
    }
    assert.deepEqual(offenders, [], `use useHoverState() instead of VHover in: ${offenders.join(', ')}`)
  })
})
