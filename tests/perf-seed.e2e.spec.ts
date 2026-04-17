/**
 * Performance profiling seed for the edit-config page.
 *
 * This is NOT a regular test — it's a Playwright seed file used with the
 * Playwright MCP tools to set up a browser session for interactive performance
 * profiling of the page editor (edit-config).
 *
 * Usage with Playwright MCP:
 *   generator_setup_page({ seedFile: 'tests/perf-seed.e2e.spec.ts', project: 'e2e' })
 *
 * Then use browser_evaluate to inject profiling instrumentation (Long Task
 * observer, performance.mark/measure) and interact with the page to measure
 * rendering costs.
 *
 * Background:
 *   The edit-config page uses VJSF with a complex oneOf schema (38 element
 *   types). Opening an element's edit dialog triggers a full state tree rebuild
 *   in @json-layout/core, which validates each element against all oneOf
 *   variants. This caused O(n * 38) validation overhead.
 *
 *   Adding `discriminator: { propertyName: 'type' }` to the page-elements
 *   schema (api/types/page-elements/schema.js) + an upstream fix in
 *   @json-layout/core reduced dialog-open blocking time from ~2000ms to ~300ms
 *   with 15 elements.
 *
 * Key files:
 *   - api/types/page-elements/schema.js — element oneOf schema with discriminator
 *   - ui/src/pages/pages/[pageId]/edit-config.vue — the page under test
 *   - node_modules/@json-layout/core/src/state/state-node.js:574 — oneOf resolution
 */

import { test } from './fixtures/login.ts'
import { axiosAuth, clean } from './support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test('perf profiling seed', async ({ page, goToWithAuth }) => {
  await clean()

  const portal = (await user1.post('/api/portals', {
    config: { title: 'Perf Test Portal', menu: { children: [] } }
  })).data

  // Create a page with empty elements — complexity is added via browser_evaluate
  // during the profiling session
  const createdPage = (await user1.post('/api/pages', {
    type: 'generic',
    config: { title: 'Perf Test Page', elements: [] },
    portals: [portal._id],
    owner: portal.owner
  })).data

  await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')

  // Wait for the VJSF form to be fully rendered
  await page.waitForTimeout(3000)
})
