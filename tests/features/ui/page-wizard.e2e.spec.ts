import { test, expect } from '../../fixtures/login.ts'
import { clean } from '../../support/axios.ts'

// The wizard's cards move it to the next step when clicked, but were plain text to
// assistive technology: a judged simulation's person was told « not a button or a link »
// each time it clicked one.
test.describe('page creation wizard', () => {
  test.beforeEach(clean)

  test('its choice cards are buttons', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages/new', 'test_admin')
    await page.getByRole('button', { name: /Catalogue d'événements/ }).click({ timeout: 30_000 })
    await expect(page.getByRole('button', { name: /Page blanche/ })).toBeVisible()
  })
})
