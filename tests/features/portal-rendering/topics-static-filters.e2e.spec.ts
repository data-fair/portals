// A topics list only offers the topics of what its catalog shows: inside a catalog it takes the
// catalog's static filters, elsewhere it can be given its own.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import { deleteDatasets, seedDataset } from '../../support/data-fair.ts'

const user1 = await axiosAuth('test_admin@test.com')
const seeded: string[] = []

test.describe('topics list static filters', () => {
  test.slow()
  test.beforeEach(clean)
  test.afterAll(async () => { await deleteDatasets(seeded) })

  const seedTopics = async (portalId: string) => {
    const suffix = Date.now()
    const topics = ['A', 'B', 'C'].map(letter => ({ id: `tsf-${letter.toLowerCase()}-${suffix}`, title: `Topic ${letter}` }))
    for (const topic of topics) {
      seeded.push(await seedDataset(portalId, { id: `test-${topic.id}`, title: `Jeu ${topic.title}`, topics: [topic] }))
    }
    return topics
  }

  const chip = (page: import('@playwright/test').Page, title: string) => page.locator('.v-chip').filter({ hasText: title })

  test('inherits the catalog static filters', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Topics Filters Portal', menu: { children: [] } } })).data
    const [a, b] = await seedTopics(portal._id)
    await user1.post('/api/pages', {
      type: 'datasets',
      config: {
        title: 'Catalogue',
        elements: [{
          type: 'datasets-catalog',
          columns: 2,
          staticFilters: { includedTopics: [a, b] },
          showAdvancedFilters: true,
          advancedFilters: [{ type: 'topics' }]
        }]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id, '/datasets')
    await expect(chip(page, 'Topic A (1)')).toBeVisible({ timeout: 15_000 })
    await expect(chip(page, 'Topic B (1)')).toBeVisible()
    await expect(chip(page, 'Topic C')).toHaveCount(0)
  })

  test('own filters outside a catalog', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Topics Filters Portal', menu: { children: [] } } })).data
    const [, , c] = await seedTopics(portal._id)
    await user1.post('/api/pages', {
      type: 'home',
      config: {
        title: 'Home',
        elements: [
          { type: 'topics', datasetsStaticFilters: { includedTopics: [c] } },
          { type: 'topics' }
        ]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    // the filtered block shows C alone, the unfiltered one shows the three topics
    await expect(chip(page, 'Topic C (1)')).toHaveCount(2, { timeout: 15_000 })
    await expect(chip(page, 'Topic A (1)')).toHaveCount(1)
    await expect(chip(page, 'Topic B (1)')).toHaveCount(1)
  })
})
