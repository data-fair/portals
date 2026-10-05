import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// Judged simulations: the assistant's form tools changed the menu while the person stayed on
// « Paramètres généraux », the form sub-agent claimed « Barre de navigation » was open, and the
// person went looking for the change. A tool's write now opens the tab that shows it, and says so.
test.describe('open sections of the portal editor', () => {
  test.beforeEach(clean)

  test('a form tool writing in another tab opens that tab', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Sections Portal', menu: { children: [] } } })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await expect(page.getByRole('tab', { name: 'Paramètres généraux' })).toHaveAttribute('aria-selected', 'true', { timeout: 30_000 })
    await page.waitForFunction(() => (navigator as any).modelContext?.listTools?.().some((t: any) => t.name === 'portalConfig_editArray'), null, { timeout: 15_000 })

    const text = await page.evaluate(async () => {
      const result = await (navigator as any).modelContext.callTool({ name: 'portalConfig_editArray', arguments: { path: '/menu/children', action: 'add' } })
      return result.content[0].text as string
    })
    expect(text).toContain('now on screen: « Barre de navigation »')
    await expect(page.getByRole('tab', { name: 'Barre de navigation' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByText('Lien non configuré')).toBeVisible()
  })

  test('a form tool opens the tab the assistant wants to show', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Show Portal', menu: { children: [] } } })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await expect(page.getByRole('tab', { name: 'Paramètres généraux' })).toHaveAttribute('aria-selected', 'true', { timeout: 30_000 })
    await page.waitForFunction(() => (navigator as any).modelContext?.listTools?.().some((t: any) => t.name === 'portalConfig_openSection'), null, { timeout: 15_000 })
    const text = await page.evaluate(async () => {
      const result = await (navigator as any).modelContext.callTool({ name: 'portalConfig_openSection', arguments: { path: '/menu/children' } })
      return result.content[0].text as string
    })
    expect(text).toContain('now on screen: « Barre de navigation »')
    await expect(page.getByRole('tab', { name: 'Barre de navigation' })).toHaveAttribute('aria-selected', 'true')
  })
})
