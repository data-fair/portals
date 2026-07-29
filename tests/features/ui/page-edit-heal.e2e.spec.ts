import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import { MongoClient } from 'mongodb'

const user1 = await axiosAuth('test_admin@test.com')

// Create a valid page through the API then inject legacy data directly in mongo:
// the current API rejects such configs, but old versions of the editor stored them
// (typically leftovers of an element type switch) and page duplication copied them
// around. The page editor must keep working on them.
// The e2e stack always runs against the dev API server, hence the development database.
const injectLegacyData = async (pageId: string, mongoPatch: Record<string, any>) => {
  const client = await MongoClient.connect(`mongodb://localhost:${process.env.MONGO_PORT}/data-fair-portals-development`)
  try {
    const result = await client.db().collection('pages').updateOne({ _id: pageId as any }, mongoPatch)
    if (result.matchedCount !== 1) throw new Error(`mongo legacy data injection matched ${result.matchedCount} pages`)
  } finally {
    await client.close()
  }
}

const createPage = async () => {
  const portal = (await user1.post('/api/portals', {
    config: { title: 'Heal Test Portal', menu: { children: [] } }
  })).data

  return (await user1.post('/api/pages', {
    type: 'generic',
    config: {
      title: 'Heal Test Page',
      elements: [{ uuid: 'el000001', type: 'title', titleSize: 'h3', content: 'hello title' }],
      genericMetadata: { slug: 'heal-test' }
    },
    portals: [portal._id],
    owner: portal.owner
  })).data
}

test.describe('page editor on legacy configs rejected by the schema', () => {
  test.beforeEach(clean)

  test('heals stale properties and saves the draft again', async ({ page, goToWithAuth }) => {
    // mb was never accepted on title elements, this reproduces the real stored data
    // that made the editor inert (grey draft buttons, edits silently dropped)
    const createdPage = await createPage()
    await injectLegacyData(createdPage._id, {
      $set: { 'config.elements.0.mb': 0, 'draftConfig.elements.0.mb': 0 }
    })
    const injected = (await user1.get(`/api/pages/${createdPage._id}`)).data
    expect(injected.draftConfig.elements[0].mb).toBe(0)

    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 30_000 })

    // the stale property is healed on load, no config error is reported
    await expect(page.getByRole('alert').filter({ hasText: 'La configuration de la page contient des erreurs' })).toHaveCount(0)

    // an edit must reach the API again (this used to be silently dropped)
    const patchResponse = page.waitForResponse(response =>
      response.url().includes(`/api/pages/${createdPage._id}`) &&
      response.request().method() === 'PATCH' &&
      response.ok()
    )
    await page.getByLabel('Titre').fill('Heal Test Page renamed')
    await page.getByLabel('Titre').blur()
    await patchResponse

    // the draft now differs from the published config, the draft actions activate
    await expect(page.locator('.v-list-item', { hasText: 'Valider le brouillon' })).not.toHaveClass(/v-list-item--disabled/)

    // the saved draft is the healed one
    const saved = (await user1.get(`/api/pages/${createdPage._id}`)).data
    expect(saved.draftConfig.elements[0].mb).toBeUndefined()
    expect(saved.draftConfig.title).toBe('Heal Test Page renamed')
  })

  test('reports the errors it cannot heal instead of silently blocking saves', async ({ page, goToWithAuth }) => {
    // a wrong value type cannot be healed by removals nor by schema defaults, and the
    // form does not display errors carried by page elements, so the editor reports them
    // in a dedicated alert
    const createdPage = await createPage()
    await injectLegacyData(createdPage._id, {
      $set: { 'config.elements.0.content': 42, 'draftConfig.elements.0.content': 42 }
    })

    await goToWithAuth(`/portals-manager/pages/${createdPage._id}/edit-config`, 'test_admin')
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 30_000 })

    const alert = page.getByRole('alert').filter({ hasText: 'La configuration de la page contient des erreurs' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('/elements/0/content')
  })
})
