import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// Create a home page and publish it through the real draft flow so the API
// generates the server-side markdown (`_html`) that text elements render.
const createHomePage = async (portal: any, elements: any[]) => {
  const config = { title: 'Home', elements }
  const page = (await user1.post('/api/pages', {
    type: 'home',
    config,
    portals: [portal._id],
    owner: portal.owner
  })).data
  await user1.patch(`/api/pages/${page._id}`, { draftConfig: config })
  await user1.post(`/api/pages/${page._id}/draft`)
  return page
}

test.describe('hover effects and links style', () => {
  test.beforeEach(clean)

  test('box element applies configured hover effect classes', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Hover Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [{
      type: 'card',
      title: 'Ma boite',
      children: [],
      actions: [],
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' },
      hover: { effects: ['elevate', 'titleUnderline'] }
    }])

    await goToPortal(portal._id)
    const card = page.locator('.v-card.pt-hover')
    await expect(card).toBeVisible({ timeout: 10_000 })
    await expect(card).toHaveClass(/pt-hover--elevate/)
    await expect(card).toHaveClass(/pt-hover--title-underline/)
    await expect(card).toHaveClass(/pt-hover--no-darken/)
  })

  test('portal hover defaults apply to blocks without override', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Defaults Portal', menu: { children: [] }, defaults: { hover: { effects: ['background'], color: 'secondary' } } }
    })).data
    await createHomePage(portal, [{
      type: 'card',
      title: 'Ma boite',
      children: [],
      actions: [],
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' }
    }])

    await goToPortal(portal._id)
    const card = page.locator('.v-card.pt-hover')
    await expect(card).toBeVisible({ timeout: 10_000 })
    await expect(card).toHaveClass(/pt-hover--background/)
  })

  test('unconfigured portal keeps native darken behavior only', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Legacy Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [{
      type: 'card',
      title: 'Ma boite',
      children: [],
      actions: [],
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' }
    }])

    await goToPortal(portal._id)
    const card = page.locator('.v-card.pt-hover')
    await expect(card).toBeVisible({ timeout: 10_000 })
    await expect(card).not.toHaveClass(/pt-hover--no-darken/)
    await expect(card).not.toHaveClass(/pt-hover--elevate/)
  })

  test('text links are underlined by default', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Links Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [{ type: 'text', content: 'Voir [mon lien](https://example.com/page) pour en savoir plus.' }])

    await goToPortal(portal._id)
    const link = page.locator('a.simple-link', { hasText: 'mon lien' })
    await expect(link).toBeVisible({ timeout: 10_000 })
    await expect(link).toHaveCSS('text-decoration-line', 'underline')
  })

  test('linksConfig underline never disables underline', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'No Underline Portal', menu: { children: [] }, linksConfig: { underline: 'never' } }
    })).data
    await createHomePage(portal, [{ type: 'text', content: 'Voir [mon lien](https://example.com/page) pour en savoir plus.' }])

    await goToPortal(portal._id)
    const link = page.locator('a.simple-link', { hasText: 'mon lien' })
    await expect(link).toBeVisible({ timeout: 10_000 })
    await expect(link).toHaveCSS('text-decoration-line', 'none')
  })
})
