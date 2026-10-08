import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// Judged simulations: after « Ajouter un lien », the new « Lien non configuré » row had a
// drop-down with no name, so neither the person nor the assistant could say where to click.
test.describe('menu items of the portal editor', () => {
  test.beforeEach(clean)

  test('a new menu item names the drop-down that chooses its type', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Menu Portal', menu: { children: [{ type: 'standard', subtype: 'home' }] } }
    })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await page.getByRole('tab', { name: 'Barre de navigation' }).click({ timeout: 30_000 })
    await page.getByRole('button', { name: 'Ajouter un lien' }).click()
    await expect(page.getByText('Lien non configuré')).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Type de lien' })).toBeVisible()
  })

  test('the navigation preview keeps the last valid state while a new item is incomplete', async ({ page, goToWithAuth }) => {
    // the preview went blank as soon as the unconfigured row existed, right where the
    // assistant had just told the person to look
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Menu Preview Portal', menu: { children: [{ type: 'standard', subtype: 'home' }] } }
    })).data
    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await page.getByRole('tab', { name: 'Barre de navigation' }).click({ timeout: 30_000 })
    const preview = page.locator('.v-card', { hasText: 'Aperçu - Entête & Barre de navigation' }).first()
    await expect(preview.getByText('Menu Preview Portal').first()).toBeVisible()
    await page.getByRole('button', { name: 'Ajouter un lien' }).click()
    await expect(page.getByText('Lien non configuré')).toBeVisible()
    await expect(preview.getByText('Menu Preview Portal').first()).toBeVisible()
    await expect(preview.getByText('dernier état valide')).toBeVisible()
  })
})
