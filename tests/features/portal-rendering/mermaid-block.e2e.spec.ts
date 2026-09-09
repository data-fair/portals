import { test, expect, portalUrl } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const createPortalWithDiagram = async (title: string, element: Record<string, unknown>) => {
  const portal = (await user1.post('/api/portals', {
    config: { title, menu: { children: [] } }
  })).data
  await user1.post('/api/pages', {
    type: 'home',
    config: {
      title: 'Home',
      elements: [
        { uuid: 't1', type: 'title', content: 'Diagram page', titleSize: 'h2' },
        element
      ]
    },
    portals: [portal._id],
    owner: portal.owner
  })
  return portal
}

test.describe('mermaid block', () => {
  test.beforeEach(clean)

  test('renders the diagram as an inline svg, with a loader as SSR fallback', async ({ page, request, goToPortal }) => {
    const portal = await createPortalWithDiagram('Diagram Portal', {
      uuid: 'mm1',
      type: 'mermaid',
      code: 'graph TD;\n  Collecte-->Publication;\n  Publication-->Reutilisation;',
      description: 'Chaîne de traitement de la donnée'
    })

    // mermaid only runs in the browser, so the server response carries a loader, not the source
    const html = await (await request.get(portalUrl(portal._id), { timeout: 20_000 })).text()
    expect(html).toContain('v-progress-circular')
    expect(html).not.toContain('Collecte--&gt;Publication')
    // the page has mdi icons, so only the mermaid-generated svg must be absent
    expect(html).not.toContain('id="mermaid-mm1')

    await goToPortal(portal._id)
    await expect(page.getByText('Diagram page')).toBeVisible({ timeout: 15_000 })

    const diagram = page.getByRole('img', { name: 'Chaîne de traitement de la donnée' })
    await expect(diagram).toBeVisible({ timeout: 15_000 })
    await expect(diagram.locator('svg')).toBeVisible()
    await expect(diagram.locator('svg')).toContainText('Reutilisation')
  })

  test('degrades to the source instead of breaking the page when the syntax is invalid', async ({ page, goToPortal }) => {
    const portal = await createPortalWithDiagram('Broken Diagram Portal', {
      uuid: 'mm2',
      type: 'mermaid',
      code: 'notadiagram\n  A --> B'
    })

    await goToPortal(portal._id)
    await expect(page.getByText('Diagram page')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('notadiagram')).toBeVisible({ timeout: 15_000 })
    // no error alert for visitors, and no half-rendered diagram left behind
    await expect(page.locator('[id^="mermaid-"], [id^="dmermaid-"]')).toHaveCount(0)
  })
})
