import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('page edit WebMCP agent integration', () => {
  test.beforeEach(clean)

  test('should register WebMCP tools and share state with VJSF form', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'WebMCP Test Portal', menu: { children: [] } }
    })).data

    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'WebMCP Test Page',
        elements: [],
        genericMetadata: { slug: 'webmcp-test' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(
      `/portals-manager/pages/${createdPage._id}/edit-config`,
      'test_admin'
    )

    // Wait for VJSF form to render
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 10000 })

    // Verify agent action button exists
    await expect(page.locator('[data-action-id="configure-page"]')).toBeVisible()

    // Verify WebMCP tools are registered via navigator.modelContext
    const hasTools = await page.evaluate(() => {
      const mc = (navigator as any).modelContext
      if (!mc || typeof mc.listTools !== 'function') return false
      const tools = mc.listTools()
      const toolNames = tools.map((t: any) => t.name)
      return toolNames.includes('pageConfig_getData') &&
             toolNames.includes('pageConfig_setFieldValue')
    })
    expect(hasTools).toBe(true)

    // Test state sharing: use WebMCP callTool to change the title
    // The title field is at /$comp-1/title due to the layout section wrapper
    const setResult = await page.evaluate(async () => {
      const mc = (navigator as any).modelContext
      return await mc.callTool({
        name: 'pageConfig_setFieldValue',
        arguments: { path: '/$comp-1/title', value: 'Updated via WebMCP' }
      })
    })
    expect((setResult as any).isError).not.toBe(true)

    // Verify the VJSF form reflects the change
    await expect(page.getByLabel('Titre')).toHaveValue('Updated via WebMCP', { timeout: 5000 })

    // Test reverse: edit via VJSF form, verify StatefulLayout data
    await page.getByLabel('Titre').fill('Edited in form')
    await page.getByLabel('Titre').press('Tab') // trigger blur

    // Wait for the blur-based update to propagate
    await page.waitForTimeout(500)

    const slData = await page.evaluate(async () => {
      const mc = (navigator as any).modelContext
      return await mc.callTool({ name: 'pageConfig_getData', arguments: {} })
    })

    // The StatefulLayout should reflect the form edit
    expect((slData as any)?.structuredContent?.data?.title).toBe('Edited in form')
  })

  test('should give the agent access to page elements via WebMCP', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'WebMCP Elements Portal', menu: { children: [] } }
    })).data

    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Elements Test Page',
        elements: [{ uuid: 'test1', type: 'title', titleSize: 'h2' }],
        genericMetadata: { slug: 'elements-test' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToWithAuth(
      `/portals-manager/pages/${createdPage._id}/edit-config`,
      'test_admin'
    )

    // Wait for VJSF form and WebMCP tools to be ready
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 10000 })
    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return mc && typeof mc.listTools === 'function' && mc.listTools().some((t: any) => t.name === 'pageConfig_getData')
    }, { timeout: 10000 })

    // Verify getData returns elements
    const getData = await page.evaluate(async () => {
      const mc = (navigator as any).modelContext
      return await mc.callTool({ name: 'pageConfig_getData', arguments: {} })
    })
    const data = (getData as any)?.structuredContent?.data
    expect(data.elements).toBeDefined()
    expect(data.elements).toHaveLength(1)
    expect(data.elements[0].type).toBe('title')
  })
})
