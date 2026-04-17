import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('portals UI', () => {
  test.beforeEach(clean)

  test('should display empty state when no portals exist', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/portals', 'test_admin')
    await expect(page.getByText('Vous n\'avez pas encore créé de portail')).toBeVisible({ timeout: 10000 })
  })

  test('should display portals list', async ({ page, goToWithAuth }) => {
    // Create a portal via API
    await user1.post('/api/portals', { config: { title: 'Test Portal E2E', menu: { children: [] } } })

    await goToWithAuth('/portals-manager/portals', 'test_admin')
    await expect(page.getByText('Test Portal E2E')).toBeVisible({ timeout: 10000 })
  })

  test('should load portal settings page', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Portal Settings Test', menu: { children: [] } } })).data

    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    // The portal settings page shows a vjsf form, wait for it to load
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 })
  })

  test('should preserve assisted mode colors when switching to manual mode', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Theme Color Test', menu: { children: [] } }
    })).data

    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 })

    // Navigate to the "Apparence" tab
    await page.getByRole('tab', { name: 'Apparence' }).click()

    // In assisted mode, change the primary color in the browser
    const assistedPrimaryInput = page.getByLabel('Couleur principale')
    await assistedPrimaryInput.click()
    await assistedPrimaryInput.fill('#FF0000')
    await assistedPrimaryInput.press('Tab')
    // Wait for blur-based VJSF update
    await page.waitForTimeout(500)

    // Switch assisted mode off (without saving first)
    await page.getByLabel('mode de gestion des couleurs simplifié').click()
    await page.waitForTimeout(500)

    // In manual mode, the primary color should reflect the assisted mode value
    const manualPrimaryInput = page.getByLabel('Couleur principale').first()
    await expect(manualPrimaryInput).toHaveValue('#FF0000')
  })

  test('should preserve manual mode colors when switching to assisted mode', async ({ page, goToWithAuth }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Theme Manual to Assisted Test', menu: { children: [] } }
    })).data

    await goToWithAuth(`/portals-manager/portals/${portal._id}`, 'test_admin')
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 })

    // Navigate to the "Apparence" tab
    await page.getByRole('tab', { name: 'Apparence' }).click()

    // Switch assisted mode off to enter manual mode
    await page.getByLabel('mode de gestion des couleurs simplifié').click()
    await page.waitForTimeout(500)

    // In manual mode, change the primary color
    const manualPrimaryInput = page.getByLabel('Couleur principale').first()
    await manualPrimaryInput.click()
    await manualPrimaryInput.fill('#00FF00')
    await manualPrimaryInput.press('Tab')
    await page.waitForTimeout(500)

    // Switch assisted mode back on (without saving first)
    await page.getByLabel('mode de gestion des couleurs simplifié').click()
    await page.waitForTimeout(500)

    // In assisted mode, the primary color should reflect the manual mode value
    const assistedPrimaryInput = page.getByLabel('Couleur principale')
    await expect(assistedPrimaryInput).toHaveValue('#00FF00')
  })
})
